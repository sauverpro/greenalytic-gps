import {
  authenticateUser,
  getUserByUsername,
  getAllDevices,
  getDeviceByIMEI,
  getLastPosition,
  getHistoricalTrack,
  getMileage,
  toJsonPResponse,
} from '../models.js';
import { sendJsonPResponse, parseJsonPData } from '../utils/jsonpHelper.js';

/**
 * Handle JSONP login request (Proc_Login)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleLogin(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [username, password] = params;

    if (!username || !password) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['Username and password are required']],
      });
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 1,
        m_arrField: ['Result'],
        m_arrRecord: [['0']],
      });
    }

    // Return simple success response (1 = success, 0 = fail)
    sendJsonPResponse(res, req.query.Callback, {
      m_isResultOk: 1,
      m_arrField: ['Result'],
      m_arrRecord: [['1']],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get user request (Proc_GetUser)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetUser(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [username] = params;

    if (!username) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['Username is required']],
      });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['User not found']],
      });
    }

    sendJsonPResponse(res, req.query.Callback, toJsonPResponse([user]));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get all devices request (Proc_GetCar)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetAllDevices(req, res, next) {
  try {
    const devices = await getAllDevices();
    sendJsonPResponse(res, req.query.Callback, toJsonPResponse(devices));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get device info request (Proc_GetCarInfo)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetDeviceInfo(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [imei] = params;

    if (!imei) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['IMEI is required']],
      });
    }

    const device = await getDeviceByIMEI(imei);

    if (!device) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['Device not found']],
      });
    }

    sendJsonPResponse(res, req.query.Callback, toJsonPResponse([device]));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get last position request (Proc_GetLastPosition)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetLastPosition(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [imei] = params;

    if (!imei) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['IMEI is required']],
      });
    }

    const position = await getLastPosition(imei);

    if (!position) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['No position data found']],
      });
    }

    sendJsonPResponse(res, req.query.Callback, toJsonPResponse([position]));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get historical track request (Proc_GetTrack)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetTrack(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [imei, startTime, endTime] = params;

    if (!imei || !startTime || !endTime) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['IMEI, startTime, and endTime are required']],
      });
    }

    const track = await getHistoricalTrack(
      imei,
      parseInt(startTime, 10),
      parseInt(endTime, 10)
    );

    sendJsonPResponse(res, req.query.Callback, toJsonPResponse(track));
  } catch (error) {
    next(error);
  }
}

/**
 * Handle JSONP get mileage request (Proc_GetMileage)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleGetMileage(req, res, next) {
  try {
    const params = parseJsonPData(req.query.Data);
    const [imei, startTime, endTime] = params;

    if (!imei || !startTime || !endTime) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['IMEI, startTime, and endTime are required']],
      });
    }

    const mileage = await getMileage(
      imei,
      parseInt(startTime, 10),
      parseInt(endTime, 10)
    );

    if (!mileage) {
      return sendJsonPResponse(res, req.query.Callback, {
        m_isResultOk: 0,
        m_arrField: ['error'],
        m_arrRecord: [['No mileage data found']],
      });
    }

    sendJsonPResponse(res, req.query.Callback, toJsonPResponse([mileage]));
  } catch (error) {
    next(error);
  }
}
