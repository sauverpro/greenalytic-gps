import apiClient from './client';

/**
 * Location API endpoints
 */

export interface LocationData {
  imei: string;
  time: number;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  mileage: number;
  gpsSignal: number;
  gsmSignal: number;
  carState: number;
  deviceState: number;
  alarmState: number;
}

export interface TrackPoint {
  time: number;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
}

export interface MileageData {
  imei: string;
  totalMileage: number;
  periodMileage: number;
}

/**
 * Get last known location for a device
 */
export async function getLastLocation(imei: string): Promise<LocationData | null> {
  try {
    const response = await apiClient.get<LocationData>(`/api/locations/${imei}/last`);
    return response.data;
  } catch (error) {
    console.error('Failed to get last location:', error);
    return null;
  }
}

/**
 * Get historical track for a device
 */
export async function getHistoricalTrack(
  imei: string,
  startTime: number,
  endTime: number
): Promise<TrackPoint[]> {
  try {
    const response = await apiClient.get<TrackPoint[]>(`/api/locations/${imei}/track`, {
      params: {
        startTime,
        endTime,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get historical track:', error);
    return [];
  }
}

/**
 * Get device mileage
 */
export async function getDeviceMileage(
  imei: string,
  startTime?: number,
  endTime?: number
): Promise<MileageData | null> {
  try {
    const response = await apiClient.get<MileageData>(`/api/locations/${imei}/mileage`, {
      params: {
        startTime,
        endTime,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get device mileage:', error);
    return null;
  }
}
