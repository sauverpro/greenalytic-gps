import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { startTCPServer } from './tcpServer.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import locationRoutes from './routes/locations.js';
import userRoutes from './routes/users.js';
import jsonpRoutes from './routes/jsonp.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/Interface', jsonpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    // Start TCP server for GPS devices
    startTCPServer();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀 HTTP Server running on http://localhost:${PORT}`);
      console.log(`📡 JSONP API available at http://localhost:${PORT}/Interface/AppJson.asp`);
      console.log(`🌐 REST API available at http://localhost:${PORT}/api`);
      console.log(`\n✅ Server ready to receive GPS data`);
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`⚠️  GPS DEVICE CONNECTION SETUP REQUIRED`);
      console.log(`${'='.repeat(70)}`);
      console.log(`\nYour GPS device needs a public IP to connect.`);
      console.log(`Free tunnel services require credit card for TCP.`);
      console.log(`\nRecommended solutions:`);
      console.log(`\n1. Deploy to Cloud VPS (RECOMMENDED):`);
      console.log(`   - Oracle Cloud (Free tier)`);
      console.log(`   - DigitalOcean ($4/month)`);
      console.log(`   - AWS EC2 (Free for 12 months)`);
      console.log(`\n2. Router Port Forwarding:`);
      console.log(`   - Forward port 8800 to 192.168.1.76`);
      console.log(`   - Use public IP: 102.22.171.14`);
      console.log(`   - SMS: SERVER,1,102.22.171.14,8800,0#`);
      console.log(`\n3. Ngrok with Credit Card (Free plan):`);
      console.log(`   - Add card at: https://dashboard.ngrok.com/settings#id-verification`);
      console.log(`   - No charges on free plan`);
      console.log(`\n💡 For testing: Use local network if GPS device is nearby`);
      console.log(`   SMS: SERVER,1,192.168.1.76,8800,0#`);
      console.log(`${'='.repeat(70)}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
