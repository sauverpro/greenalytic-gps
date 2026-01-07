import apiClient, { buildQueryString } from './client';
import type { Command, CommandResult, CommandHistory, ApiResponse } from '../types';

/**
 * Command Control API endpoints
 */

/**
 * Send command to device
 */
export async function sendCommand(
  mds: string,
  macid: string,
  cmd: string,
  param?: string,
  pwd?: string,
  sendTime?: string
): Promise<ApiResponse<CommandResult[]>> {
  const params: any = {
    method: 'SendCommands',
    mds,
    macid,
    cmd,
  };

  if (param) params.param = param;
  if (pwd) params.pwd = pwd;
  if (sendTime) params.sendTime = sendTime;

  const response = await apiClient.get<ApiResponse<CommandResult[]>>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Query command execution result
 */
export async function getCommandResult(
  mds: string,
  macid: string,
  cmdNo: string
): Promise<ApiResponse> {
  const params = {
    method: 'GetCommandResults',
    mds,
    macid,
    cmdNo,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get command history
 */
export async function getCommandHistory(
  mds: string,
  macid: string,
  count?: number
): Promise<ApiResponse<CommandHistory[]>> {
  const params: any = {
    method: 'GetSendCmdList',
    mds,
    macid,
    _t: Date.now(),
  };

  if (count) params.count = count;

  const response = await apiClient.get<ApiResponse<CommandHistory[]>>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Clear command queue and history
 */
export async function clearCommands(mds: string, macid: string): Promise<ApiResponse> {
  const params = {
    method: 'ClearCmdList',
    mds,
    macid,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDataService.aspx?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Arm device (convenience function)
 */
export async function armDevice(mds: string, macid: string, pwd?: string): Promise<ApiResponse<CommandResult[]>> {
  return sendCommand(mds, macid, 'SAFEON', undefined, pwd);
}

/**
 * Disarm device (convenience function)
 */
export async function disarmDevice(mds: string, macid: string, pwd?: string): Promise<ApiResponse<CommandResult[]>> {
  return sendCommand(mds, macid, 'SAFEOFF', undefined, pwd);
}

/**
 * Get device version (convenience function)
 */
export async function getDeviceVersion(mds: string, macid: string, pwd?: string): Promise<ApiResponse<CommandResult[]>> {
  return sendCommand(mds, macid, 'GETVERSION', undefined, pwd);
}

/**
 * Send pass-through command
 * @param mode - 0 for text, 1 for hexadecimal
 * @param data - data to send
 */
export async function sendPassthrough(
  mds: string,
  macid: string,
  mode: number,
  data: string,
  pwd?: string
): Promise<ApiResponse<CommandResult[]>> {
  const param = `${mode},${data}`;
  return sendCommand(mds, macid, 'PASSTHROUGH', param, pwd);
}
