/**
 * Alarm type names and descriptions
 */
export const ALARM_TYPES: Record<number, { name: string; description: string; severity: 'high' | 'medium' | 'low' }> = {
  0: { name: 'SOS', description: 'SOS Emergency', severity: 'high' },
  1: { name: 'Overspeed', description: 'Overspeed Alarm', severity: 'medium' },
  3: { name: 'Fence In', description: 'Entered Geofence', severity: 'medium' },
  4: { name: 'Fence Out', description: 'Exited Geofence', severity: 'medium' },
  6: { name: 'Power Cut', description: 'Power Cut Alarm', severity: 'high' },
  7: { name: 'Low Power', description: 'Low Battery', severity: 'medium' },
  8: { name: 'Fault', description: 'Device Fault', severity: 'high' },
  9: { name: 'Emergency', description: 'Emergency Alarm', severity: 'high' },
  10: { name: 'Info Request', description: 'Information Application', severity: 'low' },
  11: { name: 'Siren', description: 'Siren Alarm', severity: 'high' },
  14: { name: 'Fatigue', description: 'Fatigue Driving', severity: 'medium' },
  38: { name: 'Engine Idle', description: 'Engine Idle Alarm', severity: 'low' },
  61: { name: 'Expiration', description: 'Device Expiring/Expired', severity: 'low' },
};

/**
 * Command names and descriptions
 */
export const COMMAND_TYPES: Record<string, string> = {
  SAFEON: 'Arm Device',
  SAFEOFF: 'Disarm Device',
  GETVERSION: 'Get Version',
  PASSTHROUGH: 'Pass-through Command',
  REBOOT: 'Reboot Device',
  RESET: 'Reset Device',
  LOCATE: 'Get Location',
};

/**
 * Device online status
 */
export const DEVICE_STATUS = {
  OFFLINE: { label: 'Offline', color: 'gray' },
  ONLINE_STATIONARY: { label: 'Online (Stationary)', color: 'yellow' },
  ONLINE_MOVING: { label: 'Online (Moving)', color: 'green' },
  NOT_ACTIVATED: { label: 'Not Activated', color: 'red' },
  EXPIRED: { label: 'Expired', color: 'red' },
} as const;

/**
 * Map types
 */
export const MAP_PROVIDERS = {
  BAIDU: 'Baidu Maps',
  GAODE: 'Amap (Gaode)',
  GOOGLECN: 'Google Maps (CN)',
  QQ: 'Tencent Maps',
} as const;

/**
 * Login types
 */
export const LOGIN_TYPES = {
  ENTERPRISE: 'Enterprise Account',
  USER: 'Device Login',
} as const;

/**
 * Signal types
 */
export const SIGNAL_TYPES: Record<number, string> = {
  10: 'GPS',
  1: 'WiFi',
  16: 'LBS (Base Station)',
  0: 'Beidou',
};

/**
 * Error codes
 */
export const ERROR_CODES: Record<number, string> = {
  200: 'Success',
  403: 'Token expired or invalid',
  404: 'Not found',
  500: 'Server error',
  9: 'Already bound by another user',
};

/**
 * Command response messages
 */
export const COMMAND_RESPONSES: Record<string, string> = {
  SEND_SUCCESS: 'Operation successful',
  SEND_FAIL: 'Operation failed',
  PWD_ERROR: 'Wrong password',
  NOT_CUSTOMER: 'Customer does not exist',
  USER_LEAVE: 'Device offline, scheduled for execution',
  'Not Online': 'Device offline, scheduled for execution',
  PERMISSIONS: 'Experience account, cannot send commands',
  Nonsupport: 'Command not supported',
  SEND_OK: 'Command sent successfully',
  Fail: 'Command failed to send',
  DeviceNot: 'Device does not exist',
  Cmd_ExceedLength: 'Queue full, check command history',
};
