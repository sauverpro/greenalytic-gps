import {
  getLastPosition,
  getHistoricalTrack,
  getMileage,
} from '../models.js';

/**
 * Get last position for a device
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getLastLocation(req, res, next) {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    const position = await getLastPosition(imei);

    if (!position) {
      return res.status(404).json({ error: 'No location data found for this device' });
    }

    res.json({
      imei: position.strteid,
      time: position.ntime,
      latitude: position.dblat,
      longitude: position.dblon,
      speed: position.nspeed,
      direction: position.ndirection,
      mileage: position.nmileage,
      gpsSignal: position.ngpssignal,
      gsmSignal: position.ngsmsignal,
      carState: position.ncarstate,
      deviceState: position.ntestate,
      alarmState: position.nalarmstate,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get historical track for a device
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getTrack(req, res, next) {
  try {
    const { imei } = req.params;
    const { startTime, endTime, limit } = req.query;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' });
    }

    const track = await getHistoricalTrack(
      imei,
      parseInt(startTime, 10),
      parseInt(endTime, 10),
      limit ? parseInt(limit, 10) : 5000
    );

    const formattedTrack = track.map((point) => ({
      imei: point.strteid,
      time: point.ntime,
      latitude: point.dblat,
      longitude: point.dblon,
      speed: point.nspeed,
      direction: point.ndirection,
      mileage: point.nmileage,
      gpsSignal: point.ngpssignal,
      gsmSignal: point.ngsmsignal,
      carState: point.ncarstate,
      deviceState: point.ntestate,
      alarmState: point.nalarmstate,
    }));

    res.json(formattedTrack);
  } catch (error) {
    next(error);
  }
}

/**
 * Get mileage for a device in a time range
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getDeviceMileage(req, res, next) {
  try {
    const { imei } = req.params;
    const { startTime, endTime } = req.query;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' });
    }

    const mileage = await getMileage(
      imei,
      parseInt(startTime, 10),
      parseInt(endTime, 10)
    );

    if (!mileage) {
      return res.status(404).json({ error: 'No mileage data found for this device' });
    }

    res.json({
      imei: mileage.strTEID,
      startMileage: mileage.nStartMileage,
      endMileage: mileage.nEndMileage,
      totalMileage: mileage.nMileage,
    });
  } catch (error) {
    next(error);
  }
}
