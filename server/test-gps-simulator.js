import net from 'net';

const SERVER_HOST = 'localhost';
const SERVER_PORT = 8800;

/**
 * Simulate GPS device sending data
 */
function simulateGPSDevice() {
  const client = new net.Socket();

  client.connect(SERVER_PORT, SERVER_HOST, () => {
    console.log('✅ Connected to GPS server');
    console.log(`📡 Server: ${SERVER_HOST}:${SERVER_PORT}\n`);

    // Simulate GPS data for multiple devices with realistic routes
    const testData = [
      // Device 1: ABC-1234 (123456789012345) - Moving through Bangkok
      {
        imei: '123456789012345',
        carNumber: 'ABC-1234',
        lat: 13.7563,
        lon: 100.5018,
        speed: 45,
        direction: 90,
        mileage: 1500,
      },
      {
        imei: '123456789012345',
        carNumber: 'ABC-1234',
        lat: 13.7573,
        lon: 100.5028,
        speed: 50,
        direction: 95,
        mileage: 1502,
      },
      {
        imei: '123456789012345',
        carNumber: 'ABC-1234',
        lat: 13.7583,
        lon: 100.5038,
        speed: 55,
        direction: 100,
        mileage: 1504,
      },
      
      // Device 2: XYZ-5678 (234567890123456) - Delivery route
      {
        imei: '234567890123456',
        carNumber: 'XYZ-5678',
        lat: 13.7463,
        lon: 100.5318,
        speed: 40,
        direction: 180,
        mileage: 2800,
      },
      {
        imei: '234567890123456',
        carNumber: 'XYZ-5678',
        lat: 13.7453,
        lon: 100.5308,
        speed: 35,
        direction: 175,
        mileage: 2802,
      },
      {
        imei: '234567890123456',
        carNumber: 'XYZ-5678',
        lat: 13.7443,
        lon: 100.5298,
        speed: 30,
        direction: 170,
        mileage: 2804,
      },
      
      // Device 3: DEF-9012 (345678901234567) - Truck route
      {
        imei: '345678901234567',
        carNumber: 'DEF-9012',
        lat: 13.7663,
        lon: 100.5118,
        speed: 60,
        direction: 45,
        mileage: 5200,
      },
      {
        imei: '345678901234567',
        carNumber: 'DEF-9012',
        lat: 13.7673,
        lon: 100.5128,
        speed: 65,
        direction: 50,
        mileage: 5203,
      },
      {
        imei: '345678901234567',
        carNumber: 'DEF-9012',
        lat: 13.7683,
        lon: 100.5138,
        speed: 70,
        direction: 55,
        mileage: 5206,
      },
      
      // Device 4: GHI-3456 (456789012345678) - Service vehicle
      {
        imei: '456789012345678',
        carNumber: 'GHI-3456',
        lat: 13.7363,
        lon: 100.5218,
        speed: 25,
        direction: 270,
        mileage: 3100,
      },
      {
        imei: '456789012345678',
        carNumber: 'GHI-3456',
        lat: 13.7353,
        lon: 100.5208,
        speed: 20,
        direction: 265,
        mileage: 3102,
      },
      {
        imei: '456789012345678',
        carNumber: 'GHI-3456',
        lat: 13.7343,
        lon: 100.5198,
        speed: 15,
        direction: 260,
        mileage: 3104,
      },
      
      // Device 5: JKL-7890 (567890123456789) - Emergency vehicle (fast)
      {
        imei: '567890123456789',
        carNumber: 'JKL-7890',
        lat: 13.7763,
        lon: 100.5418,
        speed: 80,
        direction: 135,
        mileage: 8500,
      },
      {
        imei: '567890123456789',
        carNumber: 'JKL-7890',
        lat: 13.7773,
        lon: 100.5428,
        speed: 85,
        direction: 140,
        mileage: 8504,
      },
      {
        imei: '567890123456789',
        carNumber: 'JKL-7890',
        lat: 13.7783,
        lon: 100.5438,
        speed: 90,
        direction: 145,
        mileage: 8508,
      },
    ];

    let index = 0;

    // Send GPS data every 2 seconds
    const interval = setInterval(() => {
      if (index >= testData.length) {
        console.log('\n✅ All test data sent');
        console.log(`📊 Total: ${testData.length} location updates from 5 devices`);
        clearInterval(interval);
        setTimeout(() => client.destroy(), 1000);
        return;
      }

      const data = testData[index];
      const timestamp = Math.floor(Date.now() / 1000);

      // Format: IMEI,timestamp,lat,lon,speed,direction,mileage,gpsSignal,gsmSignal,carState,deviceState,alarmState
      const message = [
        data.imei,
        timestamp,
        data.lat,
        data.lon,
        data.speed,
        data.direction,
        data.mileage,
        5, // GPS signal (0-5)
        4, // GSM signal (0-5)
        1, // Car state (0=off, 1=on)
        1, // Device state
        0, // Alarm state (0=normal)
      ].join(',');

      console.log(`📤 [${index + 1}/${testData.length}] ${data.carNumber} (${data.imei}):`, 
                  `Lat ${data.lat}, Lon ${data.lon}, Speed ${data.speed} km/h`);
      client.write(message + '\r\n');

      index++;
    }, 2000);
  });

  client.on('data', (data) => {
    console.log('📥 Server response:', data.toString().trim());
  });

  client.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  client.on('close', () => {
    console.log('🔌 Connection closed');
  });
}

// Run simulator
console.log('🚀 GPS Device Simulator\n');
console.log('This will simulate a GPS device sending location data to your server.\n');

simulateGPSDevice();
