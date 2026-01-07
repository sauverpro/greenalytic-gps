import express from 'express';
import {
  getDevices,
  getDevice,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../controllers/deviceController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/devices - Get all devices
router.get('/', optionalAuth, asyncHandler(getDevices));

// GET /api/devices/:imei - Get device by IMEI
router.get('/:imei', asyncHandler(getDevice));

// POST /api/devices - Create new device
router.post('/', authenticateToken, asyncHandler(addDevice));

// PUT /api/devices/:imei - Update device by IMEI
router.put('/:imei', authenticateToken, asyncHandler(updateDevice));

// DELETE /api/devices/:imei - Delete device by IMEI
router.delete('/:imei', authenticateToken, asyncHandler(deleteDevice));

export default router;
