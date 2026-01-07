import type { DeviceStatus, DeviceStateNumber, AlarmState } from '../types';

/**
 * Parse 8-character status string into DeviceStatus object
 * Format: each position represents a boolean state (0 = false, 1 = true)
 */
export function parseDeviceStatus(status: string): DeviceStatus {
  const chars = status.split('');
  return {
    accState: chars[0] === '1',
    protectState: chars[1] === '1',
    oilState: chars[2] === '1',
    chargingStatus: chars[3] === '1',
    doorStatus: chars[4] === '1',
    positioningStatus: chars[5] === '1',
    elecState: chars[6] === '1',
    defend: chars[7] === '1',
    gpsOnOff: chars[8] === '1',
  };
}

/**
 * Parse comma-separated state number string into DeviceStateNumber object
 * Format: "mil,oil,weight,tempc,betteryV,powerV,gpscount,gsmlevel,clockwise,vehicle,lock,temp1,temp2,temp3,height,signalType,step,vehicleNum"
 */
export function parseStateNumber(stateNumber: string): DeviceStateNumber {
  const values = stateNumber.split(',').map((v) => parseFloat(v) || 0);
  
  return {
    mil: values[0] || 0,
    oil: values[1] || 0,
    weight: values[2] || 0,
    tempc: values[3] || 0,
    betteryV: values[4] || 0,
    powerV: values[5] || 0,
    gpscount: values[6] || 0,
    gsmlevel: values[7] || 0,
    clockwiseState: values[8] || 0,
    vehicleState: values[9] || 0,
    lockcnt: values[10] || 0,
    temp1: values[11] || 0,
    temp2: values[12] || 0,
    temp3: values[13] || 0,
    height: values[14] || 0,
    signalType: values[15] || 0,
    stepNumber: values[16] || 0,
    vehicleNumber: values[17] || 0,
  };
}

/**
 * Parse 4-byte (32-bit) alarm state integer into AlarmState object
 * Each bit represents a specific alarm type
 */
export function parseAlarmState(alarmState: number): AlarmState {
  return {
    // Byte 1
    sos: !!(alarmState & 0x80),
    overspeed: !!(alarmState & 0x40),
    fenceIn: !!(alarmState & 0x20),
    fenceOut: !!(alarmState & 0x10),
    powerCut: !!(alarmState & 0x08),
    fuelCut: !!(alarmState & 0x04),
    circuitCut: !!(alarmState & 0x02),
    collision: !!(alarmState & 0x01),
    // Byte 2
    lowPower: !!(alarmState & 0x8000),
    fault: !!(alarmState & 0x4000),
    emergency: !!(alarmState & 0x2000),
    infoApplication: !!(alarmState & 0x1000),
    siren: !!(alarmState & 0x0800),
    fatigueDriving: !!(alarmState & 0x0400),
    engineIdle: !!(alarmState & 0x0200),
    tow: !!(alarmState & 0x0100),
    // Byte 3
    forbidDriving: !!(alarmState & 0x800000),
    tempHigh: !!(alarmState & 0x400000),
    tempLow: !!(alarmState & 0x200000),
    fuelTheft: !!(alarmState & 0x100000),
    illegalEngineOn: !!(alarmState & 0x080000),
    doorOpen: !!(alarmState & 0x040000),
    shock: !!(alarmState & 0x020000),
    engineOn: !!(alarmState & 0x010000),
    // Byte 4
    customAlarm1: !!(alarmState & 0x80000000),
    customAlarm2: !!(alarmState & 0x40000000),
    customAlarm3: !!(alarmState & 0x20000000),
    customAlarm4: !!(alarmState & 0x10000000),
    theft: !!(alarmState & 0x08000000),
    arrearage: !!(alarmState & 0x04000000),
    gasLeak: !!(alarmState & 0x02000000),
    parkingOvertime: !!(alarmState & 0x01000000),
  };
}

/**
 * Parse car state integer into object
 */
export function parseCarState(carState: number): Record<string, boolean> {
  return {
    engine: !!(carState & 0x80),
    jobOn: !!(carState & 0x40),
    doorSensor: !!(carState & 0x20),
    shock: !!(carState & 0x08),
    fuel: !!(carState & 0x02),
    disarm: !!(carState & 0x01),
    // Byte 2
    speedChange: !!(carState & 0x8000),
    engineChange: !!(carState & 0x4000),
    taxiMeter: !!(carState & 0x2000),
    arm: !!(carState & 0x1000),
    doorLock: !!(carState & 0x0800),
    heavyVehicle: !!(carState & 0x0400),
    addFuel: !!(carState & 0x0200),
    fuelAbnormal: !!(carState & 0x0100),
  };
}

/**
 * Parse device state integer into object
 */
export function parseDeviceState(deviceState: number): Record<string, boolean> {
  return {
    locationValid: !(deviceState & 0x80), // Inverted logic
    gsmBlind: !(deviceState & 0x40),
    gprs: !!(deviceState & 0x20),
    batteryConnected: !(deviceState & 0x10),
    gpsBlind: !!(deviceState & 0x08),
    gpsFault: !!(deviceState & 0x04),
    gpsOn: !!(deviceState & 0x02),
    gpsOff: !!(deviceState & 0x01),
    // Byte 2
    externalPower: !!(deviceState & 0x8000),
    batteryPower: !!(deviceState & 0x4000),
    lbsLocation: !!(deviceState & 0x2000),
    wifiLocation: !!(deviceState & 0x1000),
    virtualLocation: !!(deviceState & 0x0800),
    lcdFault: !!(deviceState & 0x0400),
    ttsFault: !!(deviceState & 0x0200),
    cameraFault: !!(deviceState & 0x0100),
  };
}

/**
 * Get battery percentage from betteryV value
 * If > 100, it's in volts (need to subtract 100 to get V)
 * If <= 100, it's already percentage
 */
export function parseBatteryValue(betteryV: number): { isPercentage: boolean; value: number } {
  if (betteryV > 100) {
    return {
      isPercentage: false,
      value: betteryV - 100, // Volts
    };
  }
  return {
    isPercentage: true,
    value: betteryV, // Percentage
  };
}

/**
 * Parse track point data string
 * Format: "lon,lat,time,speed,direction,bool#data$value#data"
 */
export function parseTrackPoint(dataString: string): any {
  const [coordPart, ...rest] = dataString.split(',');
  const parts = rest.join(',').split('bool#');
  const [lon, lat, timestamp, speed, direction] = dataString.split(',').slice(0, 5);

  let boolData = {};
  let valueData = {};

  if (parts.length > 1) {
    const [boolStr, valueStr] = parts[1].split('$value#');
    
    if (boolStr) {
      const boolValues = boolStr.split('|');
      boolData = {
        accOn: boolValues[0] === '1',
        armed: boolValues[1] === '1',
        positioned: boolValues[2] === '1',
        oilElec: boolValues[4] === '1',
        door: boolValues[5] === '1',
        charge: boolValues[6] === '1',
      };
    }

    if (valueStr) {
      const valueValues = valueStr.split('|');
      valueData = {
        mileage: parseFloat(valueValues[0]) || 0,
        oil: parseFloat(valueValues[1]) || 0,
        battery: parseFloat(valueValues[4]) || 0,
        gpsCount: parseInt(valueValues[5]) || 0,
        gsmLevel: parseInt(valueValues[6]) || 0,
        signalType: valueValues[valueValues.length - 2] || 'GPS',
      };
    }
  }

  return {
    longitude: parseFloat(lon),
    latitude: parseFloat(lat),
    timestamp: parseInt(timestamp),
    speed: parseFloat(speed),
    direction: parseFloat(direction),
    boolData,
    valueData,
  };
}
