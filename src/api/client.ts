import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Base URL for the API
// Production: https://api.greenalytic.rw
// Development: http://localhost:3001
export const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://api.greenalytic.rw' 
    : 'http://localhost:3001');
export const POI_BASE_URL = 'http://poi.18gps.net';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token - check both locations
    let token = localStorage.getItem('mds');
    
    // Also check Zustand persist storage
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || null;
        } catch (e) {
          console.error('Failed to parse auth storage:', e);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with auth:', config.method?.toUpperCase(), config.url, 'Token present:', !!token);
    } else {
      console.log('Request without auth:', config.method?.toUpperCase(), config.url);
    }
    
    // Add timestamp to prevent caching
    if (config.params) {
      config.params.timestamp = Date.now();
    } else {
      config.params = { timestamp: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Parse JSONP responses (format: callback({...}))
    if (typeof response.data === 'string' && response.data.includes('(')) {
      const match = response.data.match(/\((.*)\)/s);
      if (match) {
        try {
          response.data = JSON.parse(match[1]);
        } catch (e) {
          console.error('Failed to parse JSONP response:', e);
        }
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors (401, 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication error:', error.response?.data);
      // Token invalid or expired - trigger logout
      localStorage.removeItem('mds');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Helper to build query string from params object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

/**
 * Get stored token (mds)
 */
export function getToken(): string | null {
  return localStorage.getItem('mds');
}

/**
 * Set token (mds)
 */
export function setToken(token: string): void {
  localStorage.setItem('mds', token);
}

/**
 * Remove token (mds)
 */
export function removeToken(): void {
  localStorage.removeItem('mds');
}

/**
 * Get stored user data
 */
export function getUserData(): Record<string, unknown> | null {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Set user data
 */
export function setUserData(userData: Record<string, unknown>): void {
  localStorage.setItem('user', JSON.stringify(userData));
}

/**
 * Remove user data
 */
export function removeUserData(): void {
  localStorage.removeItem('user');
}

/**
 * Helper to convert JSONP response to typed objects
 * Converts m_arrField and m_arrRecord format to array of objects
 */
export function parseJsonPResponse<T>(fields: string[], records: string[][]): T[] {
  return records.map((record) => {
    const obj: Record<string, string> = {};
    fields.forEach((field, index) => {
      obj[field] = record[index];
    });
    return obj as T;
  });
}

/**
 * Build JSONP request URL for gpspos.net Interface
 */
export function buildJsonPUrl(cmd: string, data: string[], field = '', callback = 'JsonP'): string {
  const dataStr = data.map(d => `N'${d}'`).join(',');
  const params: Record<string, string> = {
    Cmd: cmd,
    Data: dataStr,
    Field: field,
    Callback: callback
  };
  return `/Interface/AppJson.asp?${buildQueryString(params)}`;
}
