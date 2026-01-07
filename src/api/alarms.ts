import apiClient, { buildQueryString } from './client';
import type { AlarmResponse, AlarmDetail, ApiResponse } from '../types';

/**
 * Alarm Management API endpoints
 */

/**
 * Get real-time alarms (cached, max 150 for unit, 60 for device)
 */
export async function getRealtimeAlarms(
  mds: string,
  schoolId: string,
  maxTime: number = 0,
  type: string = 'custom'
): Promise<AlarmResponse> {
  const params = {
    method: 'queryLocalAlarmInfoUtc',
    mds,
    school_id: schoolId,
    max_time: maxTime,
    type,
    timestamp: Date.now(),
  };

  const response = await apiClient.get<AlarmResponse>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get alarm details (historical alarms with pagination)
 */
export async function getAlarmDetails(
  mds: string,
  enterpriseId: string,
  userid: string,
  beginTime: number,
  endTime: number,
  alarmType: string = '1,2,3,4,6,7,8,9,10,11,14,38,61'
): Promise<ApiResponse<AlarmDetail[]>> {
  const params = {
    method: 'alarmOperation',
    mds,
    enterprise_id: enterpriseId,
    userid,
    beginTime,
    endTime,
    alarmType,
  };

  const response = await apiClient.get<ApiResponse<AlarmDetail[]>>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Set alarm filtering (comma-separated alarm type IDs)
 */
export async function setAlarmFilter(
  mds: string,
  custid: string,
  alarmType: string
): Promise<{ success: string; msg: number; filterObj: string }> {
  const params = {
    method: 'setFilterAlarmInfo',
    mds,
    custid,
    alarmType,
  };

  const response = await apiClient.get<{ success: string; msg: number; filterObj: string }>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get current alarm filter settings
 */
export async function getAlarmFilter(mds: string): Promise<ApiResponse<number[][]>> {
  const params = {
    method: 'GetPushAlarmSwitch',
    mds,
  };

  const response = await apiClient.get<ApiResponse<number[][]>>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}
