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
 * Get public IP address
 */
async function getPublicIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    try {
      // Fallback to alternative service
      const response = await fetch('https://ifconfig.me/ip');
      return await response.text();
    } catch {
      return null;
    }
  }
}

/**
 * Start Server
 */
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    // Start TCP server for GPS devices
    startTCPServer();

    // Get public IP address
    const publicIP = await getPublicIP();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀 HTTP Server running on http://localhost:${PORT}`);
      console.log(`📡 JSONP API available at http://localhost:${PORT}/Interface/AppJson.asp`);
      console.log(`🌐 REST API available at http://localhost:${PORT}/api`);
      console.log(`\n✅ Server ready to receive GPS data`);
      
      if (publicIP) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🌍 PUBLIC IP ADDRESS`);
        console.log(`${'='.repeat(70)}`);
        console.log(`\n   ${publicIP}`);
        console.log(`\n📝 DNS Configuration:`);
        console.log(`   api.greenalytic.rw  → A → ${publicIP}`);
        console.log(`   data.greenalytic.rw → A → ${publicIP}`);
        console.log(`\n📱 GPS Device SMS Command:`);
        console.log(`   SERVER,1,api.greenalytic.rw,8800,0#`);
        console.log(`${'='.repeat(70)}\n`);
      }
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`⚠️  DEPLOYMENT INFORMATION`);
      console.log(`${'='.repeat(70)}`);
      console.log(`\nFor production deployment:`);
      console.log(`\n1. Cloud VPS (Recommended):`);
      console.log(`   - Oracle Cloud (Free tier)`);
      console.log(`   - DigitalOcean ($4/month)`);
      console.log(`   - AWS EC2 (Free for 12 months)`);
      console.log(`\n2. Configure DNS with your public IP above`);
      console.log(`\n3. Setup SSL with: sudo certbot --nginx -d api.greenalytic.rw -d data.greenalytic.rw`);
      console.log(`${'='.repeat(70)}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
