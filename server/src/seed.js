import { pool } from './database.js';
import bcrypt from 'bcrypt';

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 0. Clear existing data
    console.log('🗑️  Clearing existing data...');
    await pool.query('DELETE FROM latest_locations');
    await pool.query('DELETE FROM locations');
    await pool.query('DELETE FROM devices');
    await pool.query('DELETE FROM users');
    console.log('   ✅ Existing data cleared\n');

    // 1. Create test users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const userResult = await pool.query(
      `INSERT INTO users (
        strUser, strPassword, strName, strTel, strCompany,
        strAddress, strEmail, strRemark, nLimitSubUser, nLimitCar, nTimeout, role
      ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12),
        ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
      ON CONFLICT (strUser) DO NOTHING
      RETURNING nID, strUser, role`,
      [
        // User 1: Admin
        'admin',
        hashedPassword,
        'Admin User',
        '+1234567890',
        'GreenAlytics Inc.',
        '123 Main St, City, Country',
        'admin@greenalytics.com',
        'System Administrator',
        10,
        50,
        0,
        'admin',
        // User 2: Demo user
        'demo',
        hashedPassword,
        'Demo User',
        '+1987654321',
        'Demo Company',
        '456 Demo Ave, Demo City',
        'demo@example.com',
        'Demo account for testing',
        5,
        25,
        0,
        'user',
        // User 3: Test user
        'testuser',
        hashedPassword,
        'Test User',
        '+1555123456',
        'Test Corp',
        '789 Test Blvd',
        'test@example.com',
        'Test account',
        3,
        10,
        0,
        'user',
      ]
    );
    console.log(`   ✅ Created ${userResult.rows.length} users`);

    // Get user IDs for device assignment
    const adminUser = userResult.rows.find(u => u.struser === 'admin');
    const demoUser = userResult.rows.find(u => u.struser === 'demo');
    const testUser = userResult.rows.find(u => u.struser === 'testuser');
    
    // If users weren't just created, fetch them from database
    let adminId, demoId, testId;
    if (adminUser && demoUser && testUser) {
      adminId = adminUser.nid;
      demoId = demoUser.nid;
      testId = testUser.nid;
    } else {
      const existingUsers = await pool.query(`
        SELECT nID, strUser FROM users WHERE strUser IN ('admin', 'demo', 'testuser')
      `);
      const userMap = {};
      existingUsers.rows.forEach(u => userMap[u.struser] = u.nid);
      adminId = userMap['admin'];
      demoId = userMap['demo'];
      testId = userMap['testuser'];
    }

    // 2. Create test devices
    console.log('📱 Creating devices...');
    const deviceResult = await pool.query(
      `INSERT INTO devices (
        strTEID, strCarNum, strTESim, nTEType, strGroupName,
        strOwnerName, strOwnerTel, strOwnerAddress, strRemark,
        strIconID, nFuelBoxSize, nMileageInit, nInterval, nOverSpeed,
        nSMSNoticeState, strSMSNoticeTel1, strDeviceID, nCreateTime, user_id
      ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19),
        ($20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38),
        ($39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57),
        ($58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76),
        ($77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95)
      ON CONFLICT (strTEID) DO NOTHING
      RETURNING strTEID, strCarNum`,
      [
        // Device 1 - Assigned to demo user
        '123456789012345', 'ABC-1234', '1234567890', 'GPS-01', 'Fleet A',
        'John Doe', '+1234567890', '123 Main St', 'Primary vehicle',
        '1', '60', '0', '30', '120',
        '1', '+1234567890', '123456789012345', Date.now(), demoId,
        // Device 2 - Assigned to demo user
        '234567890123456', 'XYZ-5678', '2345678901', 'GPS-02', 'Fleet A',
        'Jane Smith', '+1987654321', '456 Oak Ave', 'Delivery van',
        '2', '50', '5000', '60', '100',
        '1', '+1987654321', '234567890123456', Date.now(), demoId,
        // Device 3 - Assigned to testuser
        '345678901234567', 'DEF-9012', '3456789012', 'GPS-03', 'Fleet B',
        'Bob Wilson', '+1555123456', '789 Pine Rd', 'Truck',
        '3', '80', '10000', '30', '110',
        '1', '+1555123456', '345678901234567', Date.now(), testId,
        // Device 4 - Assigned to testuser
        '456789012345678', 'GHI-3456', '4567890123', 'GPS-04', 'Fleet B',
        'Alice Brown', '+1555987654', '321 Elm St', 'Service vehicle',
        '4', '55', '2000', '45', '100',
        '1', '+1555987654', '456789012345678', Date.now(), testId,
        // Device 5 - Assigned to admin (unassigned - null would show to all users)
        '567890123456789', 'JKL-7890', '5678901234', 'GPS-05', 'Fleet C',
        'Charlie Davis', '+1555555555', '654 Maple Dr', 'Emergency vehicle',
        '5', '70', '15000', '20', '130',
        '1', '+1555555555', '567890123456789', Date.now(), null,
      ]
    );
    console.log(`   ✅ Created ${deviceResult.rows.length} devices`);

    // 3. Create historical location data
    console.log('📍 Creating location history...');
    const devices = deviceResult.rows;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);

    // Generate location points for each device (simulate movement)
    const locationValues = [];
    const locationParams = [];
    let paramIndex = 1;

    devices.forEach((device, deviceIndex) => {
      // Base coordinates (different starting point for each device)
      const baseLat = 40.7128 + (deviceIndex * 0.1);
      const baseLon = -74.0060 + (deviceIndex * 0.1);
      
      // Generate 20 location points over 2 hours
      for (let i = 0; i < 20; i++) {
        const timestamp = twoHoursAgo + (i * 6 * 60 * 1000); // Every 6 minutes
        const lat = baseLat + (Math.random() * 0.01 - 0.005);
        const lon = baseLon + (Math.random() * 0.01 - 0.005);
        const speed = Math.floor(Math.random() * 80) + 20; // 20-100 km/h
        const direction = Math.floor(Math.random() * 360);
        const mileage = 50000 + (i * 2); // Increase mileage
        
        locationValues.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, ` +
          `$${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, ` +
          `$${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${paramIndex + 11})`
        );
        
        locationParams.push(
          device.strteid,
          timestamp,
          lat,
          lon,
          speed,
          direction,
          mileage,
          '4', // GPS signal (1-4)
          '25', // GSM signal
          '1', // Car state (running)
          '1', // Device state (online)
          '0'  // Alarm state (no alarm)
        );
        
        paramIndex += 12;
      }
    });

    if (locationValues.length > 0) {
      const locationQuery = `
        INSERT INTO locations (
          strTEID, nTime, dbLat, dbLon, nSpeed, nDirection, nMileage,
          nGPSSignal, nGSMSignal, nCarState, nTEState, nAlarmState
        ) VALUES ${locationValues.join(', ')}
      `;

      await pool.query(locationQuery, locationParams);
      console.log(`   ✅ Created ${locationValues.length} location records`);
    } else {
      // Get existing devices if none were created
      const existingDevices = await pool.query('SELECT strTEID FROM devices LIMIT 5');
      console.log(`   ℹ️  Using ${existingDevices.rows.length} existing devices for location data`);
      
      // Generate locations for existing devices
      const newLocationValues = [];
      const newLocationParams = [];
      let newParamIndex = 1;

      existingDevices.rows.forEach((device, deviceIndex) => {
        const baseLat = 40.7128 + (deviceIndex * 0.1);
        const baseLon = -74.0060 + (deviceIndex * 0.1);
        
        for (let i = 0; i < 20; i++) {
          const timestamp = twoHoursAgo + (i * 6 * 60 * 1000);
          const lat = baseLat + (Math.random() * 0.01 - 0.005);
          const lon = baseLon + (Math.random() * 0.01 - 0.005);
          const speed = Math.floor(Math.random() * 80) + 20;
          const direction = Math.floor(Math.random() * 360);
          const mileage = 50000 + (i * 2);
          
          newLocationValues.push(
            `($${newParamIndex}, $${newParamIndex + 1}, $${newParamIndex + 2}, $${newParamIndex + 3}, ` +
            `$${newParamIndex + 4}, $${newParamIndex + 5}, $${newParamIndex + 6}, $${newParamIndex + 7}, ` +
            `$${newParamIndex + 8}, $${newParamIndex + 9}, $${newParamIndex + 10}, $${newParamIndex + 11})`
          );
          
          newLocationParams.push(
            device.strteid, timestamp, lat, lon, speed, direction, mileage,
            '4', '25', '1', '1', '0'
          );
          
          newParamIndex += 12;
        }
      });

      if (newLocationValues.length > 0) {
        const newLocationQuery = `
          INSERT INTO locations (
            strTEID, nTime, dbLat, dbLon, nSpeed, nDirection, nMileage,
            nGPSSignal, nGSMSignal, nCarState, nTEState, nAlarmState
          ) VALUES ${newLocationValues.join(', ')}
        `;
        
        await pool.query(newLocationQuery, newLocationParams);
        console.log(`   ✅ Created ${newLocationValues.length} location records`);
      }
    }

    // 4. Create latest location data (current position)
    console.log('📌 Creating latest positions...');
    
    // Get all devices (either newly created or existing)
    const allDevices = devices.length > 0 
      ? devices 
      : (await pool.query('SELECT strTEID FROM devices LIMIT 5')).rows;
    
    const latestLocationValues = [];
    const latestLocationParams = [];
    let latestParamIndex = 1;

    allDevices.forEach((device, deviceIndex) => {
      const baseLat = 40.7128 + (deviceIndex * 0.1);
      const baseLon = -74.0060 + (deviceIndex * 0.1);
      const currentLat = baseLat + (Math.random() * 0.01 - 0.005);
      const currentLon = baseLon + (Math.random() * 0.01 - 0.005);
      const currentSpeed = Math.floor(Math.random() * 80) + 20;
      const currentDirection = Math.floor(Math.random() * 360);
      
      latestLocationValues.push(
        `($${latestParamIndex}, $${latestParamIndex + 1}, $${latestParamIndex + 2}, ` +
        `$${latestParamIndex + 3}, $${latestParamIndex + 4}, $${latestParamIndex + 5}, ` +
        `$${latestParamIndex + 6}, $${latestParamIndex + 7}, $${latestParamIndex + 8}, ` +
        `$${latestParamIndex + 9}, $${latestParamIndex + 10}, $${latestParamIndex + 11})`
      );
      
      latestLocationParams.push(
        device.strteid,
        now,
        currentLat,
        currentLon,
        currentSpeed,
        currentDirection,
        50040, // Current mileage
        '4', // GPS signal
        '25', // GSM signal
        '1', // Car state
        '1', // Device state
        '0'  // Alarm state
      );
      
      latestParamIndex += 12;
    });

    const latestLocationQuery = `
      INSERT INTO latest_locations (
        strTEID, nTime, dbLat, dbLon, nSpeed, nDirection, nMileage,
        nGPSSignal, nGSMSignal, nCarState, nTEState, nAlarmState
      ) VALUES ${latestLocationValues.join(', ')}
      ON CONFLICT (strTEID) DO UPDATE SET
        nTime = EXCLUDED.nTime,
        dbLat = EXCLUDED.dbLat,
        dbLon = EXCLUDED.dbLon,
        nSpeed = EXCLUDED.nSpeed,
        nDirection = EXCLUDED.nDirection,
        nMileage = EXCLUDED.nMileage,
        nGPSSignal = EXCLUDED.nGPSSignal,
        nGSMSignal = EXCLUDED.nGSMSignal,
        nCarState = EXCLUDED.nCarState,
        nTEState = EXCLUDED.nTEState,
        nAlarmState = EXCLUDED.nAlarmState
    `;

    await pool.query(latestLocationQuery, latestLocationParams);
    console.log(`   ✅ Created ${latestLocationValues.length} latest positions`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Seed Data Summary:');
    console.log('   • 3 users created (1 admin, 2 regular users)');
    console.log('   • Password for all users: password123');
    console.log('   • 5 devices created (2 for demo, 2 for testuser, 1 unassigned)');
    console.log(`   • ${locationValues.length} historical location records`);
    console.log('   • 5 latest position records\n');
    console.log('🔐 Login Credentials:');
    console.log('   Username: admin     | Password: password123 | Role: admin     | Can see all devices');
    console.log('   Username: demo      | Password: password123 | Role: user      | Can see 2 devices (ABC-1234, XYZ-5678)');
    console.log('   Username: testuser  | Password: password123 | Role: user      | Can see 2 devices (DEF-9012, GHI-3456)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('👋 Seeding complete. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
