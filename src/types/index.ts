// ==================== COMMON TYPES ====================

export type MapType = 'BAIDU' | 'GAODE' | 'GOOGLECN' | 'QQ';

export type LoginType = 'ENTERPRISE' | 'USER';

export type Language = 'cn' | 'en';

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = unknown> {
  success: string;
  errorCode: string;
  errorDescribe: string;
  data: T;
}

// JSONP Response Format (gpspos.net)
export interface JsonPResponse {
  m_isResultOk: number; // 0 = fail, 1 = success
  m_arrField: string[]; // Field names array
  m_arrRecord: string[][]; // Records as 2D array of strings
}

export interface LoginResponse {
  id: string; // Unit ID or Device ID depending on login type
  success: string;
  mds: string; // Token
  LoginType: LoginType;
  grade: number;
  msg: string;
  errorCode: number;
}

// ==================== DEVICE TYPES ====================

export interface Device {
  imei: string; // Device IMEI
  carNumber: string; // Device Name / Plate Number
  sim: string; // Device SIM
  type: string; // Device Type
  groupName: string; // Fleet / Group Name
  ownerName: string; // Owner name
  ownerTel: string; // Owner tel
  ownerAddress: string; // Owner address
  remark: string; // Remarks
  iconId: string; // Icon ID
  deviceId: string; // Device ID
  createTime: string; // Creation timestamp
  userId?: number; // User ID (owner of the device)
}

// ==================== LOCATION TYPES ====================

export interface DeviceLocation {
  sys_time: number; // Device positioning time (UTC timestamp)
  user_name: string; // Device name
  jingdu: number; // Longitude (GPS)
  weidu: number; // Latitude (GPS)
  ljingdu: number; // Base station longitude
  lweidu: number; // Base station latitude
  datetime: number; // Data update time
  heart_time: number; // Device heartbeat time
  su: string; // Speed
  status: string; // Status group (8 chars)
  hangxiang: number; // Direction 0-360
  sim_id: string; // Device number
  user_id: string; // Device id (GUID)
  sale_type: number;
  iconType: string; // Icon
  server_time: number; // System time
  product_type: string; // Device type
  expire_date: number; // Expiration time
  group_id: string; // Monitoring group ID
  statenumber: string; // Information group
  electric: number;
  describe: string; // Device description
  sim: string; // SIM card
  precision: number; // Precision error
  isFollow: string; // Whether followed
  plateNumber: string; // Plate number
  auth: string; // Permissions
  authList: string; // Authorization list
  deptname: string; // Unit name
}

export interface LocationResponse {
  key: Record<string, number>;
  records: string[][];
  groups: string[];
  followCount?: number;
  deviceCount?: number;
  // JSONP fields (gpspos.net API)
  nID?: string;
  strTEID?: string; // Device IMEI
  nTime?: string; // UTC seconds
  dbLon?: string; // Longitude
  dbLat?: string; // Latitude
  nDirection?: string; // Direction 0-360
  nSpeed?: string; // Speed
  nGSMSignal?: string; // GSM signal
  nGPSSignal?: string; // GPS signal
  nFuel?: string; // Fuel
  nMileage?: string; // Mileage
  nTemp?: string; // Temperature
  nCarState?: string; // Car state
  nTEState?: string; // Device state
  nAlarmState?: string; // Alarm state
  strOther?: string; // Other data
}

// Status parsing (8 chars)
export interface DeviceStatus {
  accState: boolean; // ACC state (on/off)
  protectState: boolean; // Protection state
  oilState: boolean; // Oil and electricity
  chargingStatus: boolean; // Charging status
  doorStatus: boolean; // Door status
  positioningStatus: boolean; // Positioning status
  elecState: boolean; // Main power state
  defend: boolean; // Platform defense status
  gpsOnOff: boolean; // Platform invisible status
}

// State number parsing (16 comma-separated values)
export interface DeviceStateNumber {
  mil: number; // Mileage
  oil: number; // Oil quantity
  weight: number; // Weight
  tempc: number; // Temperature 1
  betteryV: number; // Backup battery capacity
  powerV: number; // Main power supply voltage
  gpscount: number; // GPS number
  gsmlevel: number; // GSM signal strength
  clockwiseState: number; // Forward and reverse
  vehicleState: number; // Vehicle state
  lockcnt: number; // Dragon lock number
  temp1: number; // Temperature 2
  temp2: number; // Temperature 3
  temp3: number; // Temperature 4
  height: number; // Height
  signalType: number; // Positioning signal type
  stepNumber: number; // Step number
  vehicleNumber: number; // Vehicle number
}

// ==================== TRACK TYPES ====================

export interface TrackPoint {
  longitude: number;
  latitude: number;
  timestamp: number;
  speed: number;
  direction: number;
  boolData: {
    accOn: boolean;
    armed: boolean;
    positioned: boolean;
    oilElec: boolean;
    door: boolean;
    charge: boolean;
  };
  valueData: {
    mileage: number;
    oil: number;
    battery: number;
    gpsCount: number;
    gsmLevel: number;
    signalType: string;
  };
  deviceStatus: number;
}

export interface StopPoint {
  id: number;
  fullName: string;
  beginDate: string;
  endDate: string;
  lon: number;
  lat: number;
  stopCar: string; // Stop duration
}

// ==================== ALARM TYPES ====================

export type AlarmType =
  | 0 // SOS
  | 1 // Overspeed
  | 3 // Fence-in
  | 4 // Fence-out
  | 6 // Power cut
  | 7 // Low power
  | 8 // Fault
  | 9 // Emergency
  | 10 // Information application
  | 11 // Siren
  | 14 // Fatigue driving
  | 38 // Engine idle
  | 61; // Device expiration

export interface Alarm {
  id: string; // Alarm ID
  macid: string; // Device ID
  course: number; // Direction
  gps_status: string; // Description
  gps_time: number; // GPS time
  jingdu: number; // Longitude
  weidu: number; // Latitude
  send_time: number; // Alarm time
  speed: string; // Speed
  status: number; // Whether processed
  type_id: AlarmType; // Alarm type
  classifyDescribe: number; // Secondary classification
  user_id: string; // Device ID (GUID)
  user_name: string; // Device name
  macname: string; // Device model
}

export interface AlarmResponse {
  total: number;
  rows: Alarm[];
  success: boolean;
}

export interface AlarmDetail {
  id: string;
  fullname: string;
  classify: number;
  lon: number;
  lat: number;
  addtime: string;
  ptime: string;
  status: number;
  speed: number;
  macid: string;
  userid: string;
  macname: string;
  NumberId: number;
  Note: string;
}

// Alarm state parsing (4 bytes, 32 bits total)
export interface AlarmState {
  // Byte 1
  sos: boolean;
  overspeed: boolean;
  fenceIn: boolean;
  fenceOut: boolean;
  powerCut: boolean;
  fuelCut: boolean;
  circuitCut: boolean;
  collision: boolean;
  // Byte 2
  lowPower: boolean;
  fault: boolean;
  emergency: boolean;
  infoApplication: boolean;
  siren: boolean;
  fatigueDriving: boolean;
  engineIdle: boolean;
  tow: boolean;
  // Byte 3
  forbidDriving: boolean;
  tempHigh: boolean;
  tempLow: boolean;
  fuelTheft: boolean;
  illegalEngineOn: boolean;
  doorOpen: boolean;
  shock: boolean;
  engineOn: boolean;
  // Byte 4
  customAlarm1: boolean;
  customAlarm2: boolean;
  customAlarm3: boolean;
  customAlarm4: boolean;
  theft: boolean;
  arrearage: boolean;
  gasLeak: boolean;
  parkingOvertime: boolean;
}

// ==================== COMMAND TYPES ====================

export interface Command {
  cmd: string; // Command name
  param?: string; // Parameters
  pwd?: string; // Device password
  sendTime?: string; // Send time
}

export interface CommandResult {
  CmdNo: string; // Receipt number
  ReturnMsg: string;
}

export interface CommandHistory {
  Describe: string; // Command word
  Param: string; // Command content
  IsOK: string; // Status
  Msg: string; // Response message
  SendTime: number; // Sending time
  AddTime: number; // Add time
  ExtData: {
    source: string;
  };
}

// ==================== MULTIMEDIA TYPES ====================

export type MultimediaType = 0 | 1 | 2 | 3; // 0: voice, 1: video, 2: picture, 3: text

export interface MultimediaRecord {
  Id: string; // Message number
  UserId: string; // Account ID
  Target: string; // Device ID or user ID or channel ID
  Content: string;
  FileName: string; // File name
  Url: string; // File address
  InfoType: MultimediaType; // Message type
  IsUser: number; // 0 = device upload, 1 = user sent
  Addtime: number; // Add time
}

// ==================== USER TYPES ====================

export interface User {
  nID: string;
  strUser: string; // Account
  strPassword: string; // Password
  strName: string; // User name
  strTel: string; // User cell
  strCompany: string; // Company
  strAddress: string; // Address
  strEmail: string; // User email
  strRemark: string; // Remark
  nLimitSubUser: string; // Sub-user quantity limit
  nLimitCar: string; // Device quantity limit
  nLimitCtrlTE: string;
  nLimitClientSoft: string;
  nTimeout: string; // Expire time
  strOpenID: string;
  nServerTime: string;
}

// ==================== MILEAGE TYPES ====================

export interface Mileage {
  strTEID: string; // Device IMEI
  nStartMileage: string; // Start mileage (meters)
  nEndMileage: string; // End mileage (meters)
  nMileage: string; // Mileage travelled (meters)
}

// ==================== DEVICE STATUS ENUMS ====================

export const DeviceOnlineStatus = {
  OFFLINE: 0,
  ONLINE_STATIONARY: 1,
  ONLINE_MOVING: 2,
} as const;

export type DeviceOnlineStatusType = typeof DeviceOnlineStatus[keyof typeof DeviceOnlineStatus];

export const SignalType = {
  GPS: 10,
  WIFI: 1,
  LBS: 16,
} as const;

export type SignalTypeValue = typeof SignalType[keyof typeof SignalType];
