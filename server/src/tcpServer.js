import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './database.js';
import { getDeviceByIMEI } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '..', 'gps-data.log');

// Helper function to log to both console and file
function logGPS(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
  // Force flush
  if (process.stdout.write) {
    process.stdout.write('');
  }
}

const TCP_PORT = parseInt(process.env.TCP_PORT || '8800');

/**
 * Parse GPS data from device
 * Supports GT06/H02 binary protocol
 * @param {Buffer} data - Raw GPS data from device
 * @returns {Object|null} Parsed location data or login info
 */
function parseGPSData(data) {
  try {
    // Check if it's GT06/H02 protocol (starts with 0x7878 or 0x7979)
    if (data.length >= 2 && (data[0] === 0x78 || data[0] === 0x79)) {
      return parseGT06Protocol(data);
    }

    // Fallback to text parsing
    const message = data.toString('utf-8').trim();
    logGPS('📡 Raw GPS data (text): ' + message);

    const parts = message.split(',');
    
    if (parts.length < 12) {
      logGPS('⚠️  Invalid GPS data format (expected 12 parts, got ' + parts.length + ')');
      return null;
    }

    return {
      strTEID: parts[0],
      nTime: parseInt(parts[1]),
      dbLat: parseFloat(parts[2]),
      dbLon: parseFloat(parts[3]),
      nSpeed: parseInt(parts[4]),
      nDirection: parseInt(parts[5]),
      nMileage: parseInt(parts[6]),
      nGPSSignal: parseInt(parts[7]),
      nGSMSignal: parseInt(parts[8]),
      nCarState: parseInt(parts[9]),
      nTEState: parseInt(parts[10]),
      nAlarmState: parseInt(parts[11]),
      nFuel: 0,
      nTemp: 0,
    };
  } catch (error) {
    logGPS('❌ Error parsing GPS data: ' + error.message);
    return null;
  }
}

/**
 * Parse GT06/H02 binary protocol
 * @param {Buffer} data - Binary data from GPS device
 * @returns {Object|null} Parsed data
 */
function parseGT06Protocol(data) {
  try {
    const startBit = data[0] === 0x78 && data[1] === 0x78 ? 2 : 4;
    const length = data[startBit];
    const protocolNumber = data[startBit + 1];

    logGPS(`📦 GT06 Protocol - Length: ${length}, Type: 0x${protocolNumber.toString(16)}`);

    // Login packet (0x01)
    if (protocolNumber === 0x01) {
      const imeiBytes = data.slice(startBit + 2, startBit + 10);
      const imei = imeiBytes.map(b => b.toString(16).padStart(2, '0')).join('');
      logGPS(`🔐 Login packet - IMEI: ${imei}`);
      return { type: 'login', imei: imei };
    }

    // Location packet (0x12 or 0x22)
    if (protocolNumber === 0x12 || protocolNumber === 0x22) {
      let offset = startBit + 2;

      // Date time (6 bytes: YY MM DD HH MM SS)
      const year = 2000 + data[offset++];
      const month = data[offset++];
      const day = data[offset++];
      const hour = data[offset++];
      const minute = data[offset++];
      const second = data[offset++];
      
      const timestamp = Math.floor(new Date(year, month - 1, day, hour, minute, second).getTime() / 1000);

      // GPS info length
      const gpsLength = data[offset++];
      
      // Latitude (4 bytes)
      const latValue = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
      offset += 4;
      let lat = latValue / 1800000.0;

      // Longitude (4 bytes)
      const lonValue = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
      offset += 4;
      let lon = lonValue / 1800000.0;

      // Speed (1 byte in km/h)
      const speed = data[offset++];

      // Course/Status (2 bytes)
      const courseStatus = (data[offset] << 8) | data[offset + 1];
      offset += 2;
      const direction = courseStatus & 0x03FF; // Lower 10 bits
      const gpsFixed = (courseStatus & 0x1000) !== 0; // Bit 12
      
      // Check hemisphere bits
      const latSouth = (courseStatus & 0x0400) !== 0; // Bit 10: 1=South, 0=North
      const lonWest = (courseStatus & 0x0800) !== 0; // Bit 11: 1=West, 0=East
      
      // Apply hemisphere corrections
      if (latSouth) lat = -lat;
      if (lonWest) lon = -lon;

      logGPS(`📍 Location - Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}, Speed: ${speed}km/h, Direction: ${direction}°, GPS: ${gpsFixed}`);

      return {
        type: 'location',
        strTEID: 'unknown', // Will be filled from stored IMEI in deviceIMEIs map
        nTime: timestamp,
        dbLat: lat,
        dbLon: lon,
        nSpeed: speed,
        nDirection: direction,
        nMileage: 0,
        nGPSSignal: gpsFixed ? 100 : 0,
        nGSMSignal: 100,
        nCarState: 0,
        nTEState: gpsFixed ? 1 : 0,
        nAlarmState: 0,
        nFuel: 0,
        nTemp: 0,
      };
    }

    // Heartbeat (0x13)
    if (protocolNumber === 0x13) {
      logGPS(`💓 Heartbeat packet`);
      return { type: 'heartbeat' };
    }

    logGPS(`⚠️  Unknown protocol number: 0x${protocolNumber.toString(16)}`);
    return null;

  } catch (error) {
    logGPS('❌ Error parsing GT06 protocol: ' + error.message);
    return null;
  }
}

/**
 * Validate if device IMEI is registered in the database
 * @param {string} imei - Device IMEI to validate
 * @returns {Promise<boolean>} True if device is registered
 */
async function isDeviceRegistered(imei) {
  try {
    const device = await getDeviceByIMEI(imei);
    return device !== null;
  } catch (error) {
    logGPS('❌ Error checking device registration: ' + error.message);
    return false;
  }
}

/**
 * Save location data to database
 * @param {Object} location - Location data to save
 */
async function saveLocationData(location) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert into locations history
    await client.query(
      `INSERT INTO locations (
        strteid, ntime, dblon, dblat, ndirection, nspeed,
        ngsmsignal, ngpssignal, nfuel, nmileage, ntemp,
        ncarstate, ntestate, nalarmstate, strother
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        location.strTEID,
        location.nTime,
        location.dbLon,
        location.dbLat,
        location.nDirection,
        location.nSpeed,
        location.nGSMSignal,
        location.nGPSSignal,
        location.nFuel,
        location.nMileage,
        location.nTemp,
        location.nCarState,
        location.nTEState,
        location.nAlarmState,
        location.strOther || null,
      ]
    );

    // Update latest location (upsert)
    await client.query(
      `INSERT INTO latest_locations (
        strteid, ntime, dblon, dblat, ndirection, nspeed,
        ngsmsignal, ngpssignal, nfuel, nmileage, ntemp,
        ncarstate, ntestate, nalarmstate, strother, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      ON CONFLICT (strteid) DO UPDATE SET
        ntime = EXCLUDED.ntime,
        dblon = EXCLUDED.dblon,
        dblat = EXCLUDED.dblat,
        ndirection = EXCLUDED.ndirection,
        nspeed = EXCLUDED.nspeed,
        ngsmsignal = EXCLUDED.ngsmsignal,
        ngpssignal = EXCLUDED.ngpssignal,
        nfuel = EXCLUDED.nfuel,
        nmileage = EXCLUDED.nmileage,
        ntemp = EXCLUDED.ntemp,
        ncarstate = EXCLUDED.ncarstate,
        ntestate = EXCLUDED.ntestate,
        nalarmstate = EXCLUDED.nalarmstate,
        strother = EXCLUDED.strother,
        updated_at = NOW()`,
      [
        location.strTEID,
        location.nTime,
        location.dbLon,
        location.dbLat,
        location.nDirection,
        location.nSpeed,
        location.nGSMSignal,
        location.nGPSSignal,
        location.nFuel,
        location.nMileage,
        location.nTemp,
        location.nCarState,
        location.nTEState,
        location.nAlarmState,
        location.strOther || null,
      ]
    );

    await client.query('COMMIT');
    logGPS(`✅ Location saved to database for device ${location.strTEID}`);
  } catch (error) {
    await client.query('ROLLBACK');
    logGPS('❌ Error saving location: ' + error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Start TCP server to receive GPS data from devices
 * @returns {net.Server} TCP server instance
 */
export function startTCPServer() {
  // Clear log file on startup
  fs.writeFileSync(logFile, `=== GPS TCP Server Started: ${new Date().toISOString()} ===\n\n`);
  logGPS('🚀 TCP Server initializing...');
  
  // Store device IMEI for later packets
  const deviceIMEIs = new Map();

  const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logGPS(`🔌 Device connected: ${clientAddress}`);

    socket.on('data', async (data) => {
      logGPS(`\n${'='.repeat(70)}`);
      logGPS(`📥 Data from ${clientAddress}: ${data.length} bytes`);
      logGPS(`📡 Raw data (HEX): ${data.toString('hex')}`);
      logGPS(`${'='.repeat(70)}\n`);
      
      const parsedData = parseGPSData(data);
      
      if (parsedData) {
        logGPS('✅ Parsed data: ' + JSON.stringify(parsedData, null, 2));

        // Handle login packet
        if (parsedData.type === 'login') {
          // Validate device is registered
          const isRegistered = await isDeviceRegistered(parsedData.imei);
          
          if (!isRegistered) {
            logGPS(`⚠️  Device ${parsedData.imei} is NOT REGISTERED - rejecting connection`);
            socket.write('UNREGISTERED DEVICE\r\n');
            socket.end();
            return;
          }
          
          deviceIMEIs.set(clientAddress, parsedData.imei);
          logGPS(`✅ Device ${parsedData.imei} is REGISTERED - login accepted`);
          
          // Send login response (GT06 protocol)
          const response = Buffer.from([0x78, 0x78, 0x05, 0x01, 0x00, 0x01, 0xD9, 0xDC, 0x0D, 0x0A]);
          socket.write(response);
          logGPS('📤 Sent login acknowledgment');
        }
        // Handle location packet
        else if (parsedData.type === 'location') {
          // Use stored IMEI if available
          if (deviceIMEIs.has(clientAddress) && parsedData.strTEID === 'unknown') {
            parsedData.strTEID = deviceIMEIs.get(clientAddress);
          }
          
          // Validate device is registered before saving location
          const isRegistered = await isDeviceRegistered(parsedData.strTEID);
          
          if (!isRegistered) {
            logGPS(`⚠️  Device ${parsedData.strTEID} is NOT REGISTERED - ignoring location data`);
            socket.write('UNREGISTERED DEVICE\r\n');
            socket.end();
            return;
          }
          
          try {
            await saveLocationData(parsedData);
            logGPS(`✅ Location saved for registered device ${parsedData.strTEID}`);
            
            // Send location acknowledgment
            const serialNum = data[data.length - 4] << 8 | data[data.length - 3];
            const response = Buffer.from([
              0x78, 0x78, 0x05, data[3], // Start + length + protocol
              serialNum >> 8, serialNum & 0xFF, // Serial number
              0x00, 0x01, // CRC placeholder
              0x0D, 0x0A // Stop bits
            ]);
            socket.write(response);
            logGPS('📤 Sent location acknowledgment');
          } catch (error) {
            logGPS('❌ Error saving location: ' + error.message);
          }
        }
        // Handle heartbeat
        else if (parsedData.type === 'heartbeat') {
          const response = Buffer.from([0x78, 0x78, 0x05, 0x13, 0x00, 0x01, 0xD9, 0xDC, 0x0D, 0x0A]);
          socket.write(response);
          logGPS('📤 Sent heartbeat acknowledgment');
        }
      } else {
        logGPS('❌ Failed to parse GPS data');
      }
    });

    socket.on('error', (error) => {
      logGPS(`❌ Socket error from ${clientAddress}: ${error.message}`);
    });

    socket.on('close', () => {
      logGPS(`🔌 Device disconnected: ${clientAddress}`);
    });
  });

  server.listen(TCP_PORT, '0.0.0.0', () => {
    logGPS(`🚀 TCP Server listening on 0.0.0.0:${TCP_PORT}`);
    logGPS(`📡 Ready to accept GPS connections from external devices`);
  });

  server.on('error', (error) => {
    logGPS('❌ TCP Server error: ' + error.message);
  });

  return server;
}

export default startTCPServer;
