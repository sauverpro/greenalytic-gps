import express from 'express';
import {
  getLastLocation,
  getTrack,
  getDeviceMileage,
} from '../controllers/locationController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/locations/:imei/last - Get last position
router.get('/:imei/last', asyncHandler(getLastLocation));

// GET /api/locations/:imei/track - Get historical track
// Query params: startTime, endTime, limit (optional)
router.get('/:imei/track', asyncHandler(getTrack));

// GET /api/locations/:imei/mileage - Get mileage
// Query params: startTime, endTime
router.get('/:imei/mileage', asyncHandler(getDeviceMileage));

export default router;
