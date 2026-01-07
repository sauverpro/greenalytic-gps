import { pool } from './database.js';
import bcrypt from 'bcrypt';

/**
 * User Operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 * @throws {Error} If user creation fails
 */
export async function createUser(userData) {
  try {
    if (!userData.strUser) {
      throw new Error('Username is required');
    }

    const hashedPassword = await bcrypt.hash(userData.strPassword || '', 10);
    
    const result = await pool.query(
      `INSERT INTO users (
        strUser, strPassword, strName, strTel, strCompany,
        strAddress, strEmail, strRemark, nLimitSubUser, nLimitCar, nTimeout, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userData.strUser,
        hashedPassword,
        userData.strName || '',
        userData.strTel || '',
        userData.strCompany || '',
        userData.strAddress || '',
        userData.strEmail || '',
        userData.strRemark || '',
        userData.nLimitSubUser || 0,
        userData.nLimitCar || 100,
        userData.nTimeout || 0,
        userData.role || 'user',
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user: ' + error.message);
  }
}

/**
 * Authenticate user with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object|null>}
 * @throws {Error} If authentication query fails
 */
export async function authenticateUser(username, password) {
  try {
    if (!username || !password) {
      return null;
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE strUser = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.strpassword);

    return isValid ? user : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw new Error('Authentication failed: ' + error.message);
  }
}

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<Object|null>}
 * @throws {Error} If query fails
 */
export async function getUserByUsername(username) {
  try {
    if (!username) {
      return null;
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE strUser = $1',
      [username]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to retrieve user: ' + error.message);
  }
}

/**
 * Get user by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 * @throws {Error} If query fails
 */
export async function getUserById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE nID = $1',
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to retrieve user: ' + error.message);
  }
}

/**
 * Get all users
 * @returns {Promise<Array>}
 * @throws {Error} If query fails
 */
export async function getAllUsers() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY strUser');
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to retrieve users: ' + error.message);
  }
}

/**
 * Update user by ID
 * @param {number} id
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>}
 * @throws {Error} If update fails
 */
export async function updateUserById(id, userData) {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (userData.strName !== undefined) {
      fields.push(`strName = $${paramIndex++}`);
      values.push(userData.strName);
    }
    if (userData.strEmail !== undefined) {
      fields.push(`strEmail = $${paramIndex++}`);
      values.push(userData.strEmail);
    }
    if (userData.strTel !== undefined) {
      fields.push(`strTel = $${paramIndex++}`);
      values.push(userData.strTel);
    }
    if (userData.strCompany !== undefined) {
      fields.push(`strCompany = $${paramIndex++}`);
      values.push(userData.strCompany);
    }
    if (userData.strAddress !== undefined) {
      fields.push(`strAddress = $${paramIndex++}`);
      values.push(userData.strAddress);
    }
    if (userData.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(userData.role);
    }
    if (userData.nLimitCar !== undefined) {
      fields.push(`nLimitCar = $${paramIndex++}`);
      values.push(userData.nLimitCar);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE nID = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user: ' + error.message);
  }
}

/**
 * Delete user by ID
 * @param {number} id
 * @returns {Promise<boolean>}
 * @throws {Error} If deletion fails
 */
export async function deleteUserById(id) {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE nID = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user: ' + error.message);
  }
}

/**
 * Device Operations
 */

/**
 * Create a new device
 * @param {Object} deviceData - Device data
 * @returns {Promise<Object>}
 * @throws {Error} If device creation fails
 */
export async function createDevice(deviceData) {
  try {
    if (!deviceData.strTEID) {
      throw new Error('Device IMEI is required');
    }

    const result = await pool.query(
      `INSERT INTO devices (
        strTEID, strCarNum, strTESim, nTEType, strGroupName,
        strOwnerName, strOwnerTel, strOwnerAddress, strRemark,
        strIconID, nFuelBoxSize, nMileageInit, nInterval, nOverSpeed,
        nSMSNoticeState, strSMSNoticeTel1, strSMSNoticeTel2, strSMSNoticeTel3,
        strNoticeEmail1, strNoticeEmail2, strNoticeEmail3, strPassword,
        nCreateTime, nSwitchType, strInfo, strDeviceID, nLimitTime, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *`,
      [
        deviceData.strTEID,
        deviceData.strCarNum || '',
        deviceData.strTESim || '',
        deviceData.nTEType || '',
        deviceData.strGroupName || '',
        deviceData.strOwnerName || '',
        deviceData.strOwnerTel || '',
        deviceData.strOwnerAddress || '',
        deviceData.strRemark || '',
        deviceData.strIconID || '0',
        deviceData.nFuelBoxSize || '0',
        deviceData.nMileageInit || '0',
        deviceData.nInterval || '0',
        deviceData.nOverSpeed || '0',
        deviceData.nSMSNoticeState || '0',
        deviceData.strSMSNoticeTel1 || '',
        deviceData.strSMSNoticeTel2 || '',
        deviceData.strSMSNoticeTel3 || '',
        deviceData.strNoticeEmail1 || '',
        deviceData.strNoticeEmail2 || '',
        deviceData.strNoticeEmail3 || '',
        deviceData.strPassword || '',
        Date.now(),
        deviceData.nSwitchType || '0',
        deviceData.strInfo || '',
        deviceData.strDeviceID || deviceData.strTEID,
        deviceData.nLimitTime || '0',
        deviceData.user_id || null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating device:', error);
    throw new Error('Failed to create device: ' + error.message);
  }
}

/**
 * Get device by IMEI
 * @param {string} imei
 * @returns {Promise<Object|null>}
 * @throws {Error} If query fails
 */
export async function getDeviceByIMEI(imei) {
  try {
    if (!imei) {
      return null;
    }

    const result = await pool.query(
      'SELECT * FROM devices WHERE strteid = $1',
      [imei]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting device:', error);
    throw new Error('Failed to retrieve device: ' + error.message);
  }
}

/**
 * Get devices for a user
 * @param {number} userId
 * @returns {Promise<Array>}
 * @throws {Error} If query fails
 */
export async function getUserDevices(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM devices WHERE user_id = $1 OR user_id IS NULL',
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting user devices:', error);
    throw new Error('Failed to retrieve user devices: ' + error.message);
  }
}

/**
 * Get all devices
 * @returns {Promise<Array>}
 * @throws {Error} If query fails
 */
export async function getAllDevices() {
  try {
    const result = await pool.query('SELECT * FROM devices ORDER BY strCarNum');
    return result.rows;
  } catch (error) {
    console.error('Error getting all devices:', error);
    throw new Error('Failed to retrieve devices: ' + error.message);
  }
}

/**
 * Update device by IMEI
 * @param {string} imei
 * @param {Object} deviceData - Device data to update
 * @returns {Promise<Object>}
 * @throws {Error} If update fails
 */
export async function updateDeviceByIMEI(imei, deviceData) {
  try {
    if (!imei) {
      throw new Error('Device IMEI is required');
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (deviceData.strCarNum !== undefined) {
      fields.push(`strCarNum = $${paramIndex++}`);
      values.push(deviceData.strCarNum);
    }
    if (deviceData.strTESim !== undefined) {
      fields.push(`strTESim = $${paramIndex++}`);
      values.push(deviceData.strTESim);
    }
    if (deviceData.nTEType !== undefined) {
      fields.push(`nTEType = $${paramIndex++}`);
      values.push(deviceData.nTEType);
    }
    if (deviceData.strGroupName !== undefined) {
      fields.push(`strGroupName = $${paramIndex++}`);
      values.push(deviceData.strGroupName);
    }
    if (deviceData.strOwnerName !== undefined) {
      fields.push(`strOwnerName = $${paramIndex++}`);
      values.push(deviceData.strOwnerName);
    }
    if (deviceData.strOwnerTel !== undefined) {
      fields.push(`strOwnerTel = $${paramIndex++}`);
      values.push(deviceData.strOwnerTel);
    }
    if (deviceData.strOwnerAddress !== undefined) {
      fields.push(`strOwnerAddress = $${paramIndex++}`);
      values.push(deviceData.strOwnerAddress);
    }
    if (deviceData.strRemark !== undefined) {
      fields.push(`strRemark = $${paramIndex++}`);
      values.push(deviceData.strRemark);
    }
    if (deviceData.strIconID !== undefined) {
      fields.push(`strIconID = $${paramIndex++}`);
      values.push(deviceData.strIconID);
    }
    if (deviceData.strDeviceID !== undefined) {
      fields.push(`strDeviceID = $${paramIndex++}`);
      values.push(deviceData.strDeviceID);
    }
    if (deviceData.user_id !== undefined) {
      fields.push(`user_id = $${paramIndex++}`);
      values.push(deviceData.user_id);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(imei);
    const query = `UPDATE devices SET ${fields.join(', ')} WHERE strteid = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Device not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating device:', error);
    throw new Error('Failed to update device: ' + error.message);
  }
}

/**
 * Delete device by IMEI
 * @param {string} imei
 * @returns {Promise<boolean>}
 * @throws {Error} If deletion fails
 */
export async function deleteDeviceByIMEI(imei) {
  try {
    if (!imei) {
      throw new Error('Device IMEI is required');
    }

    const result = await pool.query(
      'DELETE FROM devices WHERE strteid = $1 RETURNING *',
      [imei]
    );

    if (result.rows.length === 0) {
      throw new Error('Device not found');
    }

    return true;
  } catch (error) {
    console.error('Error deleting device:', error);
    throw new Error('Failed to delete device: ' + error.message);
  }
}

/**
 * Location Operations
 */

/**
 * Get last position for a device
 * @param {string} imei
 * @returns {Promise<Object|null>}
 * @throws {Error} If query fails
 */
export async function getLastPosition(imei) {
  try {
    if (!imei) {
      return null;
    }

    const result = await pool.query(
      'SELECT * FROM latest_locations WHERE strteid = $1',
      [imei]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting last position:', error);
    throw new Error('Failed to retrieve last position: ' + error.message);
  }
}

/**
 * Get historical track for a device
 * @param {string} imei
 * @param {number} startTime
 * @param {number} endTime
 * @param {number} limit
 * @returns {Promise<Array>}
 * @throws {Error} If query fails
 */
export async function getHistoricalTrack(imei, startTime, endTime, limit = 5000) {
  try {
    if (!imei || !startTime || !endTime) {
      return [];
    }

    const result = await pool.query(
      `SELECT * FROM locations 
       WHERE strteid = $1 AND nTime >= $2 AND nTime <= $3 
       ORDER BY nTime ASC 
       LIMIT $4`,
      [imei, startTime, endTime, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting historical track:', error);
    throw new Error('Failed to retrieve historical track: ' + error.message);
  }
}

/**
 * Get mileage for a device in a time range
 * @param {string} imei
 * @param {number} startTime
 * @param {number} endTime
 * @returns {Promise<Object|null>}
 * @throws {Error} If query fails
 */
export async function getMileage(imei, startTime, endTime) {
  try {
    if (!imei || !startTime || !endTime) {
      return null;
    }

    const result = await pool.query(
      `SELECT 
         strTEID,
         (SELECT nMileage FROM locations WHERE strteid = $1 AND nTime >= $2 ORDER BY nTime ASC LIMIT 1) as nStartMileage,
         (SELECT nMileage FROM locations WHERE strteid = $1 AND nTime <= $3 ORDER BY nTime DESC LIMIT 1) as nEndMileage
       FROM devices WHERE strteid = $1 LIMIT 1`,
      [imei, startTime, endTime]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const startMileage = row.nstartmileage || 0;
    const endMileage = row.nendmileage || 0;

    return {
      strTEID: imei,
      nStartMileage: startMileage,
      nEndMileage: endMileage,
      nMileage: endMileage - startMileage,
    };
  } catch (error) {
    console.error('Error getting mileage:', error);
    throw new Error('Failed to retrieve mileage: ' + error.message);
  }
}

/**
 * Helper function to convert DB rows to JSONP format
 * @param {Array} data - Array of database rows
 * @returns {Object} JSONP response format
 */
export function toJsonPResponse(data) {
  if (data.length === 0) {
    return {
      m_isResultOk: 1,
      m_arrField: [],
      m_arrRecord: [],
    };
  }

  const fields = Object.keys(data[0]);
  const records = data.map((item) =>
    fields.map((field) => String(item[field] ?? ''))
  );

  return {
    m_isResultOk: 1,
    m_arrField: fields,
    m_arrRecord: records,
  };
}
