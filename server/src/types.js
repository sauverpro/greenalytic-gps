/**
 * GPS Device Data Types (JSDoc comments for type hints)
 * 
 * This file contains JSDoc type definitions for documentation purposes.
 * JavaScript doesn't enforce these types at runtime.
 */

/**
 * @typedef {Object} DeviceInfo
 * @property {string} [nID]
 * @property {string} strTEID - Device IMEI
 * @property {string} strCarNum - Device Name
 * @property {string} strTESim - SIM card
 * @property {string} nTEType
 * @property {string} strGroupName
 * @property {string} strOwnerName
 * @property {string} strOwnerTel
 * @property {string} strOwnerAddress
 * @property {string} strRemark
 * @property {string} strIconID
 * @property {string} nFuelBoxSize
 * @property {string} nMileageInit
 * @property {string} nInterval
 * @property {string} nOverSpeed
 * @property {string} nSMSNoticeState
 * @property {string} strSMSNoticeTel1
 * @property {string} strSMSNoticeTel2
 * @property {string} strSMSNoticeTel3
 * @property {string} strNoticeEmail1
 * @property {string} strNoticeEmail2
 * @property {string} strNoticeEmail3
 * @property {string} strPassword
 * @property {string} nCreateTime
 * @property {string} nSwitchType
 * @property {string} strInfo
 * @property {string} strOpenID
 * @property {string} strDeviceID
 * @property {string} nLimitTime
 * @property {string} strProvinceID
 * @property {string} strCityID
 * @property {string} strFactoryID
 * @property {string} strDeviceModel
 * @property {string} strPlateColorID
 * @property {string} strPlateNum
 */

/**
 * @typedef {Object} LocationData
 * @property {string} [nID]
 * @property {string} strTEID - Device IMEI
 * @property {number} nTime - UTC timestamp
 * @property {number} dbLon - Longitude
 * @property {number} dbLat - Latitude
 * @property {number} nDirection - Direction 0-360
 * @property {number} nSpeed - Speed km/h
 * @property {number} nGSMSignal - GSM signal
 * @property {number} nGPSSignal - GPS signal
 * @property {number} nFuel
 * @property {number} nMileage - Mileage in meters
 * @property {number} nTemp
 * @property {number} nCarState - Car state bitfield
 * @property {number} nTEState - Device state bitfield
 * @property {number} nAlarmState - Alarm state bitfield
 * @property {string} [strOther]
 */

/**
 * @typedef {Object} User
 * @property {string} [nID]
 * @property {string} strUser - Username
 * @property {string} strPassword - Hashed password
 * @property {string} strName
 * @property {string} strTel
 * @property {string} strCompany
 * @property {string} strAddress
 * @property {string} strEmail
 * @property {string} strRemark
 * @property {number} nLimitSubUser
 * @property {number} nLimitCar
 * @property {number} nTimeout - Expire timestamp
 * @property {number} [nServerTime]
 */

/**
 * @typedef {Object} JsonPResponse
 * @property {0|1} m_isResultOk
 * @property {string[]} m_arrField
 * @property {string[][]} m_arrRecord
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} userId
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success
 * @property {string} [userId]
 * @property {string} [token]
 * @property {string} [error]
 */

export {};
