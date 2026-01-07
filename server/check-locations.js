import { pool } from './src/database.js';

async function checkLocations() {
  try {
    console.log('🔍 Checking location data in database...\n');
    
    // Check devices
    const devices = await pool.query('SELECT strteid, strcarnum FROM devices ORDER BY strteid');
    console.log('📱 Devices in database:');
    devices.rows.forEach(d => {
      console.log(`   - ${d.strcarnum}: ${d.strteid}`);
    });
    console.log(`   Total: ${devices.rows.length} devices\n`);
    
    // Check latest_locations
    const latestLocations = await pool.query(
      'SELECT strteid, dblat, dblon, nspeed, updated_at FROM latest_locations ORDER BY strteid'
    );
    console.log('📍 Latest locations in database:');
    if (latestLocations.rows.length === 0) {
      console.log('   ⚠️  NO LOCATION DATA FOUND!');
      console.log('   This means GPS data was not saved to the database.\n');
    } else {
      latestLocations.rows.forEach(loc => {
        console.log(`   - ${loc.strteid}: Lat ${loc.dblat}, Lon ${loc.dblon}, Speed ${loc.nspeed} km/h, Updated: ${loc.updated_at}`);
      });
      console.log(`   Total: ${latestLocations.rows.length} locations\n`);
    }
    
    // Check locations history count
    const locationCount = await pool.query('SELECT COUNT(*) FROM locations');
    console.log(`📊 Total location history records: ${locationCount.rows[0].count}\n`);
    
    // Test specific device
    const testImei = '123456789012345';
    const testLocation = await pool.query(
      'SELECT * FROM latest_locations WHERE strteid = $1',
      [testImei]
    );
    console.log(`🧪 Test query for device ${testImei}:`);
    if (testLocation.rows.length > 0) {
      console.log('   ✅ Found location data:');
      console.log(JSON.stringify(testLocation.rows[0], null, 2));
    } else {
      console.log('   ❌ No location data found for this IMEI');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkLocations();
