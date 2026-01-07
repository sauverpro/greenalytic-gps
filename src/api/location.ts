import apiClient, { buildQueryString, buildJsonPUrl, parseJsonPResponse } from './client';
import type { LocationResponse, ApiResponse, MapType, Mileage, StopPoint, JsonPResponse } from '../types';

/**
 * Location and Tracking API endpoints
 */

/**
 * Get last position for a device (JSONP API - gpspos.net)
 */
export async function getLastPosition(macid: string): Promise<LocationResponse | null> {
  const url = buildJsonPUrl('Proc_GetLastPosition', [macid], '', 'JsonP4');
  
  const response = await apiClient.get<JsonPResponse>(url);
  const jsonpData = response.data;

  if (jsonpData.m_isResultOk !== 1 || !jsonpData.m_arrRecord.length) {
    return null;
  }

  const positions = parseJsonPResponse<LocationResponse>(jsonpData.m_arrField, jsonpData.m_arrRecord);
  return positions[0] || null;
}

/**
 * Get historical track (JSONP API - gpspos.net)
 * @param macid - Device IMEI
 * @param startTime - Start time in UTC seconds
 * @param endTime - End time in UTC seconds
 * @param maxRecords - Maximum records to return (max 5000)
 */
export async function getHistoricalTrack(
  macid: string,
  startTime: number,
  endTime: number,
  maxRecords: number = 5000
): Promise<LocationResponse[]> {
  const url = buildJsonPUrl(
    'Proc_GetTrack',
    [macid, startTime.toString(), endTime.toString(), maxRecords.toString()],
    '',
    'JsonP5'
  );
  
  const response = await apiClient.get<JsonPResponse>(url);
  const jsonpData = response.data;

  if (jsonpData.m_isResultOk !== 1) {
    return [];
  }

  return parseJsonPResponse<LocationResponse>(jsonpData.m_arrField, jsonpData.m_arrRecord);
}

/**
 * Get mileage for a time period (JSONP API - gpspos.net)
 * @param macid - Device IMEI
 * @param startTime - Start time in UTC seconds
 * @param endTime - End time in UTC seconds
 */
export async function getMileageJsonP(
  macid: string,
  startTime: number,
  endTime: number
): Promise<Mileage | null> {
  const url = buildJsonPUrl(
    'Proc_GetMileage',
    [macid, startTime.toString(), endTime.toString()],
    '',
    'JsonP5'
  );
  
  const response = await apiClient.get<JsonPResponse>(url);
  const jsonpData = response.data;

  if (jsonpData.m_isResultOk !== 1 || !jsonpData.m_arrRecord.length) {
    return null;
  }

  const mileages = parseJsonPResponse<Mileage>(jsonpData.m_arrField, jsonpData.m_arrRecord);
  return mileages[0] || null;
}

/**
 * Get latest device location (single device) (Legacy API - 18gps.net)
 */
export async function getLatestLocation(
  mds: string,
  userId: string,
  mapType: MapType = 'BAIDU',
  option: string = 'cn'
): Promise<ApiResponse<LocationResponse[]>> {
  const params = {
    method: 'getUserAndGpsInfoByIDsUtcNew',
    mds,
    user_id: userId,
    mapType,
    option,
  };

  const response = await apiClient.get<ApiResponse<LocationResponse[]>>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get historical track by device number (IMEI)
 */
export async function getHistoricalTrackByMacid(
  mds: string,
  macid: string,
  from: number,
  to: number,
  mapType: MapType = 'BAIDU',
  playLBS: boolean = true
): Promise<string> {
  const params = {
    method: 'getHistoryMByMUtcNew',
    mds,
    macid,
    from,
    to,
    mapType,
    playLBS,
  };

  const response = await apiClient.get<string>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get historical track by device ID (GUID)
 */
export async function getHistoricalTrackByUserId(
  mds: string,
  userID: string,
  from: number,
  to: number,
  mapType: MapType = 'BAIDU',
  playLBS: boolean = true
): Promise<string> {
  const params = {
    method: 'getHistoryMByMUtc',
    mds,
    userID,
    from,
    to,
    mapType,
    playLBS,
  };

  const response = await apiClient.get<string>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get stop points within time range
 */
export async function getStopPoints(
  mds: string,
  userid: string,
  beginTime: number,
  endTime: number,
  mapType: MapType = 'BAIDU'
): Promise<StopPoint[]> {
  const params = {
    method: 'StayDetail',
    mds,
    userid,
    beginTime,
    endTime,
    mapType,
  };

  const response = await apiClient.get<StopPoint[]>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get mileage for time range (Legacy API)
 * Note: mds parameter kept for backwards compatibility but not used in JSONP format
 */
export async function getMileage(
  _mds: string,
  macid: string,
  from: number,
  to: number
): Promise<ApiResponse<Mileage[]>> {
  const params = {
    Cmd: 'Proc_GetMileage',
    Data: `N'${macid}',N'${Math.floor(from / 1000)}',N'${Math.floor(to / 1000)}'`,
    Field: '',
    Callback: 'JsonP5',
  };

  const response = await apiClient.get<ApiResponse<Mileage[]>>(
    `/Interface/AppJson.asp?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get address from coordinates (reverse geocoding)
 */
export async function getAddress(
  lat: number,
  lon: number,
  mapType: MapType = 'BAIDU'
): Promise<string> {
  const params = {
    lat,
    lon,
    map: mapType,
  };

  const response = await apiClient.get<string>(
    `http://poi.18gps.net/POI?${buildQueryString(params)}`,
    {
      baseURL: '',
    }
  );

  return response.data;
}
