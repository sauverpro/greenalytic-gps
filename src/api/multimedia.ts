import apiClient, { buildQueryString } from './client';
import type { MultimediaRecord, ApiResponse } from '../types';

/**
 * Multimedia API endpoints
 */

/**
 * Get multimedia records (real-time, last 50 or since maxTime)
 */
export async function getMultimediaRecords(
  mds: string,
  target: string,
  userId: string,
  maxTime: number = 0
): Promise<ApiResponse<MultimediaRecord[]>> {
  const params = {
    method: 'GetMultimediaRecords',
    mds,
    target,
    userId,
    maxTime,
  };

  const response = await apiClient.get<ApiResponse<MultimediaRecord[]>>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get voice history (paginated)
 */
export async function getVoiceHistory(
  mds: string,
  macid: string,
  loingId: string,
  minTime: number = 0,
  count: number = 20
): Promise<ApiResponse<MultimediaRecord[]>> {
  const params = {
    method: 'GetVoiceHistory',
    mds,
    macid,
    loingId,
    minTime,
    count,
  };

  const response = await apiClient.get<ApiResponse<MultimediaRecord[]>>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Delete recordings (supports multiple IDs)
 */
export async function deleteRecordings(
  mds: string,
  loingId: string,
  ids: string[] | string
): Promise<ApiResponse> {
  const idsString = Array.isArray(ids) ? ids.join(',') : ids;
  
  const params = {
    method: 'DeleteSingleVoice',
    mds,
    loingId,
    ids: idsString,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}
