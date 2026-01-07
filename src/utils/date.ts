import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';

/**
 * Convert UTC timestamp (milliseconds) to local date string
 */
export function formatTimestamp(timestamp: number, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return format(new Date(timestamp), formatStr);
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Calculate duration between two timestamps
 */
export function calculateDuration(startTime: number, endTime: number): string {
  const diffMs = endTime - startTime;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天${hours % 24}小时${minutes % 60}分${seconds % 60}秒`;
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * Get current UTC timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Convert date to UTC timestamp in milliseconds
 */
export function dateToTimestamp(date: Date): number {
  return date.getTime();
}

/**
 * Check if device is online based on heartbeat time
 * Device is considered offline if last heartbeat was more than 25 minutes ago
 */
export function isDeviceOnline(heartbeatTime: number, serverTime: number): boolean {
  const diffMinutes = differenceInMinutes(serverTime, heartbeatTime);
  return diffMinutes < 25;
}

/**
 * Calculate offline/stationary duration
 */
export function calculateOfflineDuration(heartbeatTime: number, serverTime: number): string {
  return calculateDuration(heartbeatTime, serverTime);
}
