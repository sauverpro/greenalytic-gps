#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, 'gps-data.log');

console.log('📡 GPS Data Monitor - Watching for incoming GPS data...\n');
console.log(`Log file: ${logFile}`);
console.log('Press Ctrl+C to stop\n');
console.log('='.repeat(70));

// Use tail to follow the log file
const tail = spawn('tail', ['-f', logFile], {
  stdio: ['ignore', 'inherit', 'inherit']
});

tail.on('error', (error) => {
  console.error('Error starting monitor:', error.message);
  console.log('\nNote: If you\'re on Windows, you can manually run:');
  console.log('  Get-Content gps-data.log -Wait -Tail 50');
  process.exit(1);
});

tail.on('close', (code) => {
  console.log(`\n\nMonitor stopped (exit code: ${code})`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nStopping GPS monitor...');
  tail.kill();
  process.exit(0);
});
