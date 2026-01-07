import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesAPI } from '../api';
import { useAuthStore } from '../stores';

/**
 * Hook to fetch device list
 */
export function useDevices() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['devices'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return devicesAPI.getDeviceList();
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch devices with latest locations
 */
export function useDevicesWithLocations() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['devices-locations'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return devicesAPI.getDeviceListWithLocations();
    },
    enabled: !!token,
    refetchInterval: 15000, // Refetch every 15 seconds for real-time updates
  });
}

/**
 * Hook to fetch single device info
 */
export function useDeviceInfo(macid: string) {
  return useQuery({
    queryKey: ['device-info', macid],
    queryFn: () => devicesAPI.getDeviceInfo(macid),
    enabled: !!macid,
  });
}

/**
 * Hook to bind device
 */
export function useBindDevice() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      macid,
      fullName,
      plateNumber,
      userId,
    }: {
      macid: string;
      fullName?: string;
      plateNumber?: string;
      userId?: number;
    }) => {
      if (!token || !user) throw new Error('No auth data found');
      return devicesAPI.bindDevice(macid, fullName, plateNumber, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

/**
 * Hook to unbind device
 */
export function useUnbindDevice() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (macid: string) => {
      if (!token || !user) throw new Error('No auth data found');
      return devicesAPI.unbindDevice(macid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

/**
 * Hook to update device info
 */
export function useUpdateDevice() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      macid,
      fullName,
      plateNumber,
      linkName,
      linkTel,
      sim,
      userId,
    }: {
      macid: string;
      fullName: string;
      plateNumber?: string;
      linkName?: string;
      linkTel?: string;
      sim?: string;
      userId?: number;
    }) => {
      if (!token) throw new Error('No token found');
      return devicesAPI.updateDeviceInfo(macid, fullName, plateNumber, linkName, linkTel, sim, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-info'] });
    },
  });
}
