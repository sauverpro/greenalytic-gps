import express from 'express';
import {
  handleLogin,
  handleGetUser,
  handleGetAllDevices,
  handleGetDeviceInfo,
  handleGetLastPosition,
  handleGetTrack,
  handleGetMileage,
} from '../controllers/jsonpController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * JSONP API endpoint compatible with gpspos.net protocol
 * GET /Interface/AppJson.asp?Cmd=<command>&Data=<params>&Callback=<callback>
 */
router.get('/AppJson.asp', asyncHandler(async (req, res, next) => {
  const { Cmd, Callback } = req.query;

  if (!Cmd || !Callback) {
    return res.status(400).json({ error: 'Cmd and Callback parameters are required' });
  }

  // Route to appropriate handler based on Cmd
  switch (Cmd) {
    case 'Proc_Login':
      return handleLogin(req, res, next);
    
    case 'Proc_GetUser':
      return handleGetUser(req, res, next);
    
    case 'Proc_GetCar':
      return handleGetAllDevices(req, res, next);
    
    case 'Proc_GetCarInfo':
      return handleGetDeviceInfo(req, res, next);
    
    case 'Proc_GetLastPosition':
      return handleGetLastPosition(req, res, next);
    
    case 'Proc_GetTrack':
      return handleGetTrack(req, res, next);
    
    case 'Proc_GetMileage':
      return handleGetMileage(req, res, next);
    
    default:
      return res.status(400).json({ error: `Unknown command: ${Cmd}` });
  }
}));

export default router;
