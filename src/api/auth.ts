import apiClient, { buildQueryString, buildJsonPUrl, parseJsonPResponse, removeToken, setUserData, removeUserData } from './client';
import type { User, ApiResponse, JsonPResponse } from '../types';

/**
 * Authentication API endpoints
 */

/**
 * Login with username and password (JSONP API - gpspos.net)
 */
export async function loginJsonP(userId: string, password: string): Promise<boolean> {
  const url = buildJsonPUrl('Proc_Login', [userId, password], '', 'JsonP5');
  
  const response = await apiClient.get<JsonPResponse>(url);
  const jsonpData = response.data;

  if (jsonpData.m_isResultOk !== 1 || !jsonpData.m_arrRecord.length) {
    return false;
  }

  // Parse the result field (1 = success, 0 = fail)
  const result = jsonpData.m_arrRecord[0][0];
  
  if (result === '1') {
    // Store user ID for future requests
    setUserData({ userId });
    return true;
  }

  return false;
}

/**
 * Get user information (JSONP API - gpspos.net)
 */
export async function getUserInfoJsonP(userId: string): Promise<User | null> {
  const url = buildJsonPUrl('Proc_GetUser', [userId], '', 'JsonP5');
  
  const response = await apiClient.get<JsonPResponse>(url);
  const jsonpData = response.data;

  if (jsonpData.m_isResultOk !== 1 || !jsonpData.m_arrRecord.length) {
    return null;
  }

  const users = parseJsonPResponse<User>(jsonpData.m_arrField, jsonpData.m_arrRecord);
  return users[0] || null;
}

/**
 * Login with username and password (REST API - returns JWT token)
 * Returns success status with token and user data
 */
export async function login(
  loginName: string,
  loginPassword: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const response = await apiClient.post<{ token: string; user: any }>('/api/auth/login', {
      username: loginName,
      password: loginPassword,
    });

    const { token, user } = response.data;
    
    // Store token in both locations for compatibility
    localStorage.setItem('mds', token);
    setUserData({ userId: user.id, username: user.username, ...user });
    
    return { success: true, token, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Login request failed' 
    };
  }
}

/**
 * Logout - clears auth token from client
 * Note: JWT tokens are stateless, so logout is client-side only
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  // Clear stored auth data
  removeToken();
  removeUserData();

  return { success: true, message: 'Logged out successfully' };
}

/**
 * Register new user account (includes device binding)
 */
export async function registerUser(
  macid: string,
  loginName: string,
  password: string,
  repassword: string
): Promise<ApiResponse> {
  const params = {
    method: 'RegisterUser',
    macid,
    loginName,
    password,
    repassword,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Change enterprise account password
 */
export async function changeAccountPassword(
  mds: string,
  newPassword: string,
  oldPassword: string,
  ismd5: number = 0
): Promise<ApiResponse> {
  const params = {
    method: 'modifyEnterprisePwd',
    mds,
    reg_pass: newPassword,
    reg_olbpass: oldPassword,
    ISMD5: ismd5,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Change device password
 */
export async function changeDevicePassword(
  mds: string,
  macid: string,
  newPassword: string,
  oldPassword: string
): Promise<ApiResponse> {
  const params = {
    method: 'modifyUserPwd',
    mds,
    macid,
    pwd: newPassword,
    oldPwd: oldPassword,
  };

  const response = await apiClient.get<ApiResponse>(
    `/GetDateServices.asmx/GetDate?${buildQueryString(params)}`
  );

  return response.data;
}

/**
 * Get user information (Legacy API)
 */
export async function getUserInfo(user: string): Promise<ApiResponse<User[]>> {
  const params = {
    Cmd: 'Proc_GetUser',
    Data: `N'${user}'`,
    Field: '',
    Callback: 'JsonP5',
  };

  const response = await apiClient.get<ApiResponse<User[]>>(
    `/Interface/AppJson.asp?${buildQueryString(params)}`
  );

  // Parse JSONP response
  return response.data;
}
