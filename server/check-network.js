#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🔍 Network Diagnostics for GPS Server\n');
console.log('='.repeat(70));

// Check if port 8800 is listening
try {
  console.log('\n1. Checking if port 8800 is listening...');
  const netstat = execSync('netstat -an | grep 8800 || netstat -an | findstr 8800', { encoding: 'utf-8' });
  console.log('✅ Port 8800 status:');
  console.log(netstat);
} catch (error) {
  console.log('⚠️  Could not check port status');
}

// Check Windows Firewall rules for port 8800
try {
  console.log('\n2. Checking Windows Firewall for port 8800...');
  const firewall = execSync('netsh advfirewall firewall show rule name=all | findstr 8800', { encoding: 'utf-8' });
  console.log('✅ Firewall rules found:');
  console.log(firewall);
} catch (error) {
  console.log('⚠️  No firewall rules found for port 8800');
  console.log('\n📋 To allow GPS connections through Windows Firewall, run as Administrator:');
  console.log('   netsh advfirewall firewall add rule name="GPS Server TCP 8800" dir=in action=allow protocol=TCP localport=8800');
}

// Check public IP
try {
  console.log('\n3. Your public IP address:');
  const publicIP = execSync('curl -s ifconfig.me', { encoding: 'utf-8' });
  console.log(`   ${publicIP}`);
  console.log('\n⚠️  Important: If your GPS device is outside your local network,');
  console.log('   you need to configure port forwarding on your router:');
  console.log('   - Forward external port 8800 to 192.168.1.76:8800');
  console.log('   - Or use your public IP instead of 102.22.171.14');
} catch (error) {
  console.log('   Could not determine public IP');
}

console.log('\n' + '='.repeat(70));
console.log('\n✅ Server Configuration:');
console.log('   - TCP Server: 0.0.0.0:8800 (listening on all interfaces)');
console.log('   - Local IP: 192.168.1.76');
console.log('   - GPS Command: SERVER,1,192.168.1.76,8800,0#');
console.log('\n📡 If GPS device is on the SAME network:');
console.log('   Use: SERVER,1,192.168.1.76,8800,0#');
console.log('\n🌐 If GPS device is on DIFFERENT network (internet):');
console.log('   1. Set up port forwarding on router: 8800 -> 192.168.1.76:8800');
console.log('   2. Use: SERVER,1,YOUR_PUBLIC_IP,8800,0#');
console.log('   3. Make sure Windows Firewall allows port 8800');

console.log('\n📋 Common Issues:');
console.log('   1. Windows Firewall blocking port 8800');
console.log('   2. Router not forwarding port (if GPS is on internet)');
console.log('   3. ISP blocking incoming connections');
console.log('   4. GPS device trying wrong IP address');

console.log('\n🔍 To monitor GPS connections:');
console.log('   npm run monitor');
console.log('   OR');
console.log('   tail -f gps-data.log\n');
