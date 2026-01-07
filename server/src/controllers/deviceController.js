import {
  getAllDevices,
  getUserDevices,
  getDeviceByIMEI,
  createDevice,
  updateDeviceByIMEI,
  deleteDeviceByIMEI,
} from '../models.js';

/**
 * Get all devices for the authenticated user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getDevices(req, res, next) {
  try {
    let devices;
    
    if (req.user) {
      // Admin can see all devices, regular users only see their own
      if (req.user.role === 'admin') {
        devices = await getAllDevices();
      } else {
        devices = await getUserDevices(req.user.id);
      }
    } else {
      devices = await getAllDevices();
    }

    const formattedDevices = devices.map((device) => ({
      imei: device.strteid,
      carNumber: device.strcarnum,
      sim: device.strtesim,
      type: device.ntetype,
      groupName: device.strgroupname,
      ownerName: device.strownername,
      ownerTel: device.strownertel,
      ownerAddress: device.strowneraddress,
      remark: device.strremark,
      iconId: device.striconid,
      deviceId: device.strdeviceid,
      createTime: device.ncreatetime,
      userId: device.user_id,
    }));

    res.json(formattedDevices);
  } catch (error) {
    next(error);
  }
}

/**
 * Get device by IMEI
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getDevice(req, res, next) {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    const device = await getDeviceByIMEI(imei);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({
      imei: device.strteid,
      carNumber: device.strcarnum,
      sim: device.strtesim,
      type: device.ntetype,
      groupName: device.strgroupname,
      ownerName: device.strownername,
      ownerTel: device.strownertel,
      ownerAddress: device.strowneraddress,
      remark: device.strremark,
      iconId: device.striconid,
      deviceId: device.strdeviceid,
      createTime: device.ncreatetime,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new device
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function addDevice(req, res, next) {
  try {
    const deviceData = {
      strTEID: req.body.imei,
      strCarNum: req.body.carNumber,
      strTESim: req.body.sim,
      nTEType: req.body.type,
      strGroupName: req.body.groupName,
      strOwnerName: req.body.ownerName,
      strOwnerTel: req.body.ownerTel,
      strOwnerAddress: req.body.ownerAddress,
      strRemark: req.body.remark,
      strIconID: req.body.iconId,
      strDeviceID: req.body.deviceId,
      user_id: req.body.userId || (req.user.role === 'admin' ? null : req.user.id),
    };

    if (!deviceData.strTEID) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    const device = await createDevice(deviceData);

    res.status(201).json({
      imei: device.strteid,
      carNumber: device.strcarnum,
      userId: device.user_id,
      message: 'Device created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update device by IMEI
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function updateDevice(req, res, next) {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    // Check if user owns this device (unless admin)
    if (req.user.role !== 'admin') {
      const existingDevice = await getDeviceByIMEI(imei);
      if (!existingDevice || existingDevice.user_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to update this device' });
      }
    }

    const deviceData = {
      strCarNum: req.body.carNumber,
      strTESim: req.body.sim,
      nTEType: req.body.type,
      strGroupName: req.body.groupName,
      strOwnerName: req.body.ownerName,
      strOwnerTel: req.body.ownerTel,
      strOwnerAddress: req.body.ownerAddress,
      strRemark: req.body.remark,
      strIconID: req.body.iconId,
      strDeviceID: req.body.deviceId,
    };
    
    // Admin can change device owner
    if (req.user.role === 'admin' && req.body.userId !== undefined) {
      deviceData.user_id = req.body.userId;
    }

    const device = await updateDeviceByIMEI(imei, deviceData);

    res.json({
      imei: device.strteid,
      carNumber: device.strcarnum,
      sim: device.strtesim,
      type: device.ntetype,
      groupName: device.strgroupname,
      ownerName: device.strownername,
      ownerTel: device.strownertel,
      ownerAddress: device.strowneraddress,
      remark: device.strremark,
      iconId: device.striconid,
      deviceId: device.strdeviceid,
      createTime: device.ncreatetime,
      userId: device.user_id,
      message: 'Device updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete device by IMEI
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function deleteDevice(req, res, next) {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({ error: 'IMEI is required' });
    }

    // Check if user owns this device (unless admin)
    if (req.user.role !== 'admin') {
      const existingDevice = await getDeviceByIMEI(imei);
      if (!existingDevice || existingDevice.user_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this device' });
      }
    }

    await deleteDeviceByIMEI(imei);

    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
