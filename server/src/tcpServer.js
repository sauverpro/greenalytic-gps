import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './database.js';

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
 * Supports multiple GPS protocols - adjust based on your device protocol
 * @param {Buffer} data - Raw GPS data from device
 * @returns {Object|null} Parsed location data
 */
function parseGPSData(data) {
  try {
    const message = data.toString('utf-8').trim();
    logGPS('📡 Raw GPS data: ' + message);

    // Example parser for common GPS protocol format
    // Format: IMEI,timestamp,lat,lon,speed,direction,mileage,gpsSignal,gsmSignal,carState,deviceState,alarmState
    
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
    console.error('❌ Error parsing GPS data:', error);
    return null;
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
  
  const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logGPS(`🔌 Device connected: ${clientAddress}`);

    socket.on('data', async (data) => {
      logGPS(`\n${'='.repeat(70)}`);
      logGPS(`📥 Data from ${clientAddress}: ${data.length} bytes`);
      logGPS(`📡 Raw data (HEX): ${data.toString('hex')}`);
      logGPS(`📡 Raw data (ASCII): ${data.toString('ascii')}`);
      logGPS(`📡 Raw data (UTF-8): ${data.toString('utf-8')}`);
      logGPS(`${'='.repeat(70)}\n`);
      
      const locationData = parseGPSData(data);
      
      if (locationData) {
        logGPS('✅ Parsed GPS data: ' + JSON.stringify(locationData, null, 2));
        try {
          await saveLocationData(locationData);
          logGPS(`✅ Location saved for device ${locationData.strTEID}`);
          // Send acknowledgment to device
          socket.write('OK\r\n');
        } catch (error) {
          logGPS('❌ Error processing GPS data: ' + error.message);
          socket.write('ERROR\r\n');
        }
      } else {
        logGPS('❌ Failed to parse GPS data');
        socket.write('INVALID\r\n');
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
