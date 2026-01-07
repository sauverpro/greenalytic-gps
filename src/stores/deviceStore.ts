import { create } from 'zustand';
import type { DeviceLocation } from '../types';

interface ParsedDevice extends DeviceLocation {
  macid: string;
  onlineStatus: 'offline' | 'online_stationary' | 'online_moving' | 'not_activated' | 'expired';
  isExpired: boolean;
  isOnline: boolean;
}

interface DeviceState {
  devices: ParsedDevice[];
  selectedDevice: ParsedDevice | null;
  setDevices: (devices: ParsedDevice[]) => void;
  updateDevice: (macid: string, data: Partial<ParsedDevice>) => void;
  setSelectedDevice: (device: ParsedDevice | null) => void;
  clearDevices: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  selectedDevice: null,
  setDevices: (devices) => set({ devices }),
  updateDevice: (macid, data) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.macid === macid ? { ...device, ...data } : device
      ),
    })),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  clearDevices: () => set({ devices: [], selectedDevice: null }),
}));
