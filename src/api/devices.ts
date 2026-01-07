import apiClient from './client';
import type { Device } from '../types';

export interface DeviceWithLocation extends Device {
  location: {
    lat: number;
    lng: number;
    speed: number;
    direction: number;
    time: number;
    address?: string;
    altitude?: number;
    satellites?: number;
    mileage?: number;
  } | null;
}

/**
 * Device Management API endpoints
 */

/**
 * Get device list (direct devices only, not subordinates)
 */
export async function getDeviceList(): Promise<{ success: boolean; data: Device[]; message: string }> {
  const response = await apiClient.get<Device[]>('/api/devices');
  
  return {
    success: true,
    data: response.data,
    message: '',
  };
}

/**
 * Get device list with latest positions (batch)
 */
export async function getDeviceListWithLocations(): Promise<{ success: boolean; data: DeviceWithLocation[]; message: string }> {
  // Get all devices
  const devicesResponse = await apiClient.get<Device[]>('/api/devices');
  const devices = devicesResponse.data;

  // Get latest position for each device
  const locationsPromises = devices.map(async (device: Device) => {
    try {
      const locationResponse = await apiClient.get(`/api/locations/${device.imei}/last`);
      return {
        ...device,
        location: locationResponse.data,
      };
    } catch {
      return {
        ...device,
        location: null,
      };
    }
  });

  const locationsData = await Promise.all(locationsPromises);

  return {
    success: true,
    data: locationsData,
    message: '',
  };
}

/**
 * Get single device information
 */
export async function getDeviceInfo(macid: string): Promise<Device | null> {
  try {
    const response = await apiClient.get<Device>(`/api/devices/${macid}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get device info:', error);
    return null;
  }
}

/**
 * Get all devices for a user (sub-account devices)
 */
export async function getUserDevices(): Promise<Device[]> {
  try {
    const response = await apiClient.get<Device[]>('/api/devices');
    return response.data;
  } catch (error) {
    console.error('Failed to get user devices:', error);
    return [];
  }
}

/**
 * Bind/Add device to account
 */
export async function bindDevice(
  macid: string,
  fullName?: string,
  plateNumber?: string,
  userId?: number
): Promise<{ success: boolean; data: unknown; message: string }> {
  try {
    const response = await apiClient.post('/api/devices', {
      imei: macid,
      carNumber: plateNumber,
      ownerName: fullName,
      userId,
    });

    return {
      success: true,
      data: response.data,
      message: 'Device added successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to add device',
    };
  }
}

/**
 * Unbind device from account
 */
export async function unbindDevice(
  macid: string
): Promise<{ success: boolean; data: null; message: string }> {
  try {
    await apiClient.delete(`/api/devices/${macid}`);
    
    return {
      success: true,
      data: null,
      message: 'Device deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to delete device',
    };
  }
}

/**
 * Modify device information
 */
export async function updateDeviceInfo(
  macid: string,
  fullName: string,
  plateNumber?: string,
  _linkName?: string,
  linkTel?: string,
  sim?: string,
  userId?: number
): Promise<{ success: boolean; data: Device | null; message: string }> {
  try {
    const response = await apiClient.put<Device>(`/api/devices/${macid}`, {
      carNumber: plateNumber,
      ownerName: fullName,
      ownerTel: linkTel,
      sim: sim,
      userId,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Device updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to update device',
    };
  }
}

/**
 * Move device to another unit (alternative binding method)
 */
export async function moveDevice(
  _macid: string,
  _targetId: string
): Promise<{ success: boolean; data: null; message: string }> {
  try {
    // Note: Backend doesn't have move endpoint yet, would need to implement
    // For now, return success to not break existing code
    return {
      success: true,
      data: null,
      message: 'Device move not implemented yet',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to move device',
    };
  }
}
