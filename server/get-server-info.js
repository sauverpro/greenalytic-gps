import os from 'os';

console.log('🌐 GPS Server Configuration Information\n');
console.log('=' .repeat(60));

// Get network interfaces
const interfaces = os.networkInterfaces();
const addresses = [];

Object.keys(interfaces).forEach(name => {
  interfaces[name].forEach(iface => {
    // Skip internal and non-IPv4 addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      addresses.push({
        name: name,
        address: iface.address,
      });
    }
  });
});

console.log('\n📍 Local IP Addresses (for devices on same network):\n');
if (addresses.length === 0) {
  console.log('   No network interfaces found');
} else {
  addresses.forEach(addr => {
    console.log(`   ${addr.name}: ${addr.address}`);
    console.log(`   Command: SERVER,1,${addr.address},8800,0#\n`);
  });
}

console.log('=' .repeat(60));
console.log('\n📱 GPS Device Configuration Steps:\n');
console.log('1. Find your server IP address above');
console.log('2. Send SMS command to GPS device:');
console.log('   SERVER,1,<your_ip>,8800,0#');
console.log('\n3. Device should respond with:');
console.log('   SERVER_OK,Currently in use Server:1,<your_ip>,8800,0;');
console.log('\n4. Device will connect to your server on port 8800');
console.log('\n=' .repeat(60));

console.log('\n🔧 For Internet Access (Remote GPS):\n');
console.log('1. Get your public IP: https://whatismyipaddress.com/');
console.log('2. Configure router port forwarding:');
console.log('   - Forward external port 8800 → internal port 8800');
console.log('   - Point to this computer\'s local IP');
console.log('3. Send command with public IP:');
console.log('   SERVER,1,<public_ip>,8800,0#');
console.log('\n=' .repeat(60));

console.log('\n⚠️  Current TCP Server Port: 8800');
console.log('💡 Make sure Windows Firewall allows port 8800\n');
