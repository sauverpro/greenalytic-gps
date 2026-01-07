import { useQuery } from '@tanstack/react-query';
import { locationsAPI } from '../api';
import { useAuthStore } from '../stores';
import type { MapType } from '../types';

/**
 * Hook to fetch latest device location
 */
export function useLatestLocation(userId: string, mapType: MapType = 'BAIDU') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['latest-location', userId, mapType],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return locationsAPI.getLastLocation(userId);
    },
    enabled: !!token && !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
  });
}

/**
 * Hook to fetch historical track
 */
export function useHistoricalTrack(
  macid: string,
  from: number,
  to: number
) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['historical-track', macid, from, to],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return locationsAPI.getHistoricalTrack(macid, from, to);
    },
    enabled: !!token && !!macid && !!from && !!to,
  });
}

/**
 * Hook to fetch stop points
 */
export function useStopPoints(
  userid: string,
  beginTime: number,
  endTime: number,
  mapType: MapType = 'BAIDU'
) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['stop-points', userid, beginTime, endTime, mapType],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      // getStopPoints not implemented yet
      return Promise.resolve([]);
    },
    enabled: !!token && !!userid && !!beginTime && !!endTime,
  });
}

/**
 * Hook to fetch mileage
 */
export function useMileage(macid: string, from: number, to: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['mileage', macid, from, to],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      // getMileage not implemented yet
      return Promise.resolve(0);
    },
    enabled: !!token && !!macid && !!from && !!to,
  });
}

/**
 * Hook to get address from coordinates
 */
export function useReverseGeocode(lat: number, lon: number, mapType: MapType = 'BAIDU') {
  return useQuery({
    queryKey: ['reverse-geocode', lat, lon, mapType],
    queryFn: () => Promise.resolve('Address lookup not implemented'),
    enabled: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
