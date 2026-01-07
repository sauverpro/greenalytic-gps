# GPS Tracking Server - Backend Structure

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/          # Business logic layer
│   │   ├── authController.js       # Authentication logic
│   │   ├── deviceController.js     # Device management logic
│   │   ├── locationController.js   # Location data logic
│   │   └── jsonpController.js      # JSONP API logic
│   │
│   ├── routes/               # API routes layer
│   │   ├── auth.js                 # Auth routes (/api/auth/*)
│   │   ├── devices.js              # Device routes (/api/devices/*)
│   │   ├── locations.js            # Location routes (/api/locations/*)
│   │   └── jsonp.js                # JSONP routes (/Interface/*)
│   │
│   ├── middleware/           # Middleware layer
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── errorHandler.js         # Error handling middleware
│   │
│   ├── utils/                # Utility functions
│   │   ├── jsonpHelper.js          # JSONP parsing/formatting
│   │   └── validation.js           # Input validation helpers
│   │
│   ├── models.js             # Database operations
│   ├── database.js           # Database connection & initialization
│   ├── tcpServer.js          # TCP server for GPS devices
│   ├── types.js              # JSDoc type definitions
│   └── index.js              # Main application entry point
│
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## 🎯 Architecture Layers

### 1. **Routes Layer** (`src/routes/`)
- Define API endpoints
- Route requests to appropriate controllers
- Apply middleware (auth, validation)
- Minimal logic, just routing

**Example:**
```javascript
// routes/devices.js
router.get('/', optionalAuth, asyncHandler(getDevices));
router.post('/', authenticateToken, asyncHandler(addDevice));
```

### 2. **Controllers Layer** (`src/controllers/`)
- Handle request/response logic
- Validate input data
- Call model functions
- Format responses
- Handle business logic

**Example:**
```javascript
// controllers/deviceController.js
export async function getDevices(req, res, next) {
  try {
    const devices = await getUserDevices(req.user.id);
    res.json(devices);
  } catch (error) {
    next(error);
  }
}
```

### 3. **Models Layer** (`src/models.js`)
- Database queries
- Data manipulation
- Business rules for data
- No HTTP knowledge

**Example:**
```javascript
// models.js
export async function getUserDevices(userId) {
  const result = await pool.query('SELECT * FROM devices WHERE user_id = $1', [userId]);
  return result.rows;
}
```

### 4. **Middleware Layer** (`src/middleware/`)
- Authentication & authorization
- Error handling
- Request logging
- Input validation

### 5. **Utils Layer** (`src/utils/`)
- Helper functions
- Format converters
- Validators
- Reusable utilities

## 📡 API Endpoints

### Authentication (`/api/auth`)
```
POST   /api/auth/login      - User login (returns JWT)
GET    /api/auth/me         - Get current user info (requires auth)
```

### Devices (`/api/devices`)
```
GET    /api/devices         - Get all devices (optional auth)
GET    /api/devices/:imei   - Get device by IMEI
POST   /api/devices         - Create new device (requires auth)
```

### Locations (`/api/locations`)
```
GET    /api/locations/:imei/last      - Get last position
GET    /api/locations/:imei/track     - Get historical track
       Query params: startTime, endTime, limit
GET    /api/locations/:imei/mileage   - Get mileage
       Query params: startTime, endTime
```

### JSONP API (`/Interface`)
```
GET    /Interface/AppJson.asp?Cmd=<command>&Data=<params>&Callback=<fn>

Commands:
- Proc_Login           - Authenticate user
- Proc_GetUser         - Get user details
- Proc_GetCar          - Get all devices
- Proc_GetCarInfo      - Get device info
- Proc_GetLastPosition - Get last GPS position
- Proc_GetTrack        - Get historical track
- Proc_GetMileage      - Get mileage data
```

## 🔐 Authentication

### JWT Authentication
The server uses JWT (JSON Web Tokens) for authentication:

1. **Login** - Get token via POST `/api/auth/login`
2. **Use Token** - Include in Authorization header: `Bearer <token>`
3. **Token Expiry** - 24 hours (configurable in JWT_SECRET)

### Middleware Usage
```javascript
// Public route (no auth)
router.get('/devices', getDevices);

// Optional auth (works with or without token)
router.get('/devices', optionalAuth, getDevices);

// Protected route (requires valid token)
router.post('/devices', authenticateToken, addDevice);
```

## ⚡ Error Handling

### Global Error Handler
All errors are caught and formatted consistently:

```javascript
{
  "error": "Error message",
  "stack": "..." // Only in development
}
```

### Async Error Handling
Use `asyncHandler` wrapper for async routes:

```javascript
router.get('/', asyncHandler(async (req, res) => {
  // Any thrown error will be caught
  const data = await someAsyncFunction();
  res.json(data);
}));
```

## 🛠️ Development Workflow

### Adding a New Feature

1. **Create Model Function** (if needed)
   ```javascript
   // models.js
   export async function getDeviceStats(imei) {
     // Database query
   }
   ```

2. **Create Controller**
   ```javascript
   // controllers/deviceController.js
   export async function getStats(req, res, next) {
     try {
       const stats = await getDeviceStats(req.params.imei);
       res.json(stats);
     } catch (error) {
       next(error);
     }
   }
   ```

3. **Add Route**
   ```javascript
   // routes/devices.js
   router.get('/:imei/stats', asyncHandler(getStats));
   ```

4. **Test Endpoint**
   ```bash
   curl http://localhost:3001/api/devices/123456789012345/stats
   ```

## 🧪 Testing

### Manual Testing
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get devices (with auth)
curl http://localhost:3001/api/devices \
  -H "Authorization: Bearer <your-token>"

# JSONP test
curl "http://localhost:3001/Interface/AppJson.asp?Cmd=Proc_Login&Data=N'testuser',N'password123'&Callback=handleResponse"
```

## 📊 Code Organization Benefits

✅ **Separation of Concerns** - Each layer has a specific responsibility
✅ **Maintainability** - Easy to find and update code
✅ **Testability** - Each layer can be tested independently
✅ **Scalability** - Easy to add new features
✅ **Reusability** - Controllers and models can be reused
✅ **Error Handling** - Centralized error management
✅ **Security** - Middleware handles authentication consistently

## 🚀 Next Steps

1. Add input validation middleware
2. Implement rate limiting
3. Add request logging
4. Set up automated tests
5. Add API documentation (Swagger)
6. Implement caching (Redis)
7. Add monitoring and metrics
