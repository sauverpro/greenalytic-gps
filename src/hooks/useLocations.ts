import { useQuery } from '@tanstack/react-query';
import { locationsAPI } from '../api';
import type { LocationData, TrackPoint, MileageData } from '../api/locations';

/**
 * Hook to fetch last location for a device
 */
export function useLastLocation(imei: string) {
  return useQuery<LocationData | null>({
    queryKey: ['location', imei],
    queryFn: () => locationsAPI.getLastLocation(imei),
    enabled: !!imei,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch historical track
 */
export function useHistoricalTrack(
  imei: string,
  startTime: number,
  endTime: number,
  enabled = true
) {
  return useQuery<TrackPoint[]>({
    queryKey: ['track', imei, startTime, endTime],
    queryFn: () => locationsAPI.getHistoricalTrack(imei, startTime, endTime),
    enabled: enabled && !!imei && !!startTime && !!endTime,
  });
}

/**
 * Hook to fetch device mileage
 */
export function useDeviceMileage(
  imei: string,
  startTime?: number,
  endTime?: number
) {
  return useQuery<MileageData | null>({
    queryKey: ['mileage', imei, startTime, endTime],
    queryFn: () => locationsAPI.getDeviceMileage(imei, startTime, endTime),
    enabled: !!imei,
  });
}

/**
 * Hook to fetch locations for multiple devices
 */
export function useDeviceLocations(imeis: string[]) {
  return useQuery({
    queryKey: ['locations', imeis],
    queryFn: async () => {
      const locations = await Promise.all(
        imeis.map(async (imei) => {
          const location = await locationsAPI.getLastLocation(imei);
          return { imei, location };
        })
      );
      return locations;
    },
    enabled: imeis.length > 0,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}
