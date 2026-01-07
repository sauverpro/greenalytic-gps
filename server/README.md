# greenAlytics GPS Tracking Server

A Node.js server that receives GPS data directly from tracking devices and provides both JSONP and REST API endpoints for the dashboard.

## Features

- 🚀 **TCP Server** - Receives real-time GPS data from devices on port 8800
- 📡 **JSONP API** - Compatible with existing gpspos.net protocol
- 🌐 **REST API** - Modern JSON API for web clients
- 💾 **PostgreSQL Database** - Stores users, devices, and location history
- ⚡ **Real-time Updates** - Maintains latest location table for fast queries

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Database Setup

Install PostgreSQL and create a database:

```sql
CREATE DATABASE greenAlytics_gps;
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
TCP_PORT=8800

DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenAlytics_gps
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key

CORS_ORIGIN=http://localhost:5173
```

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### JSONP API (gpspos.net Compatible)

Base URL: `http://localhost:3001/Interface/AppJson.asp`

**Login**
```
GET /Interface/AppJson.asp?Cmd=Proc_Login&Data=N'username',N'password'&Callback=JsonP5
```

**Get User Info**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetUser&Data=N'username'&Callback=JsonP5
```

**Get Devices**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetCar&Data=N'username'&Callback=JsonP2
```

**Get Device Info**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetCarInfo&Data=N'IMEI'&Callback=JsonP2
```

**Get Last Position**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetLastPosition&Data=N'IMEI'&Callback=JsonP4
```

**Get Historical Track**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetTrack&Data=N'IMEI',N'startTime',N'endTime',N'5000'&Callback=JsonP5
```

**Get Mileage**
```
GET /Interface/AppJson.asp?Cmd=Proc_GetMileage&Data=N'IMEI',N'startTime',N'endTime'&Callback=JsonP5
```

### REST API

**Login**
```http
POST /api/login
Content-Type: application/json

{
  "userId": "username",
  "password": "password"
}
```

**Get All Devices**
```http
GET /api/devices
```

**Get Device Info**
```http
GET /api/devices/:imei
```

**Get Last Position**
```http
GET /api/locations/:imei/last
```

**Get Historical Track**
```http
GET /api/locations/:imei/track?startTime=1234567890&endTime=1234567890&limit=5000
```

**Get Mileage**
```http
GET /api/locations/:imei/mileage?startTime=1234567890&endTime=1234567890
```

## GPS Device Configuration

Configure your GPS devices to send data to:
- **Host**: Your server IP
- **Port**: 8800 (TCP)

The server expects data in this format:
```
IMEI,timestamp,lat,lon,speed,direction,mileage,gpsSignal,gsmSignal,carState,deviceState,alarmState
```

Example:
```
00012836,1703001234,22.5700667,113.9392,60,198,3056919,8,4,0,0,0
```

**Note**: Adjust the `parseGPSData()` function in `tcpServer.ts` to match your device's protocol format.

## Database Schema

### Tables

- **users** - User accounts
- **devices** - GPS tracking devices
- **locations** - Historical location data
- **latest_locations** - Current position per device (optimized for queries)

## Update Frontend Configuration

Update your React app to use the local server:

```typescript
// src/api/client.ts
export const BASE_URL = 'http://localhost:3001';
```

## Creating a Test User

Connect to PostgreSQL and run:

```sql
-- Password will be 'password123' (hashed with bcrypt)
INSERT INTO users (strUser, strPassword, strName, strCompany)
VALUES (
  'testuser',
  '$2b$10$YourBcryptHashHere',
  'Test User',
  'Test Company'
);
```

Or use the API after server starts.

## Monitoring

View logs for incoming GPS data:
```bash
npm run dev
```

Logs will show:
- 🔌 Device connections/disconnections
- 📡 Raw GPS data received
- ✅ Successfully saved locations
- ❌ Errors

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build the server: `npm run build`
4. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name greenAlytics-server
pm2 save
pm2 startup
```

## Security Considerations

- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Enable HTTPS in production
- [ ] Validate all GPS device data
- [ ] Add device authentication
- [ ] Implement user permissions
- [ ] Regular database backups

## License

MIT
