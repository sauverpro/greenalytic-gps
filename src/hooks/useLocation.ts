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
      return locationsAPI.getLatestLocation(token, userId, mapType);
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
  to: number,
  mapType: MapType = 'BAIDU',
  playLBS: boolean = true
) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['historical-track', macid, from, to, mapType],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return locationsAPI.getHistoricalTrackByMacid(token, macid, from, to, mapType, playLBS);
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
      return locationsAPI.getStopPoints(token, userid, beginTime, endTime, mapType);
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
      return locationsAPI.getMileage(token, macid, from, to);
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
    queryFn: () => locationsAPI.getAddress(lat, lon, mapType),
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
