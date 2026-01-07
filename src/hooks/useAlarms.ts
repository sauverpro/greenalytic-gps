import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmsAPI } from '../api';
import { useAuthStore } from '../stores';

/**
 * Hook to fetch real-time alarms
 */
export function useRealtimeAlarms(schoolId: string, maxTime: number = 0) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['realtime-alarms', schoolId, maxTime],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return alarmsAPI.getRealtimeAlarms(token, schoolId, maxTime);
    },
    enabled: !!token && !!schoolId,
    refetchInterval: 10000, // Poll every 10 seconds for real-time alarms
  });
}

/**
 * Hook to fetch historical alarm details
 */
export function useAlarmDetails(
  userid: string,
  beginTime: number,
  endTime: number,
  alarmType?: string
) {
  const { token, user } = useAuthStore();

  return useQuery({
    queryKey: ['alarm-details', userid, beginTime, endTime, alarmType],
    queryFn: () => {
      if (!token || !user) throw new Error('No auth data found');
      return alarmsAPI.getAlarmDetails(token, user.id, userid, beginTime, endTime, alarmType);
    },
    enabled: !!token && !!user && !!userid && !!beginTime && !!endTime,
  });
}

/**
 * Hook to set alarm filter
 */
export function useSetAlarmFilter() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alarmType: string) => {
      if (!token || !user) throw new Error('No auth data found');
      return alarmsAPI.setAlarmFilter(token, user.id, alarmType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarm-filter'] });
      queryClient.invalidateQueries({ queryKey: ['realtime-alarms'] });
    },
  });
}

/**
 * Hook to get alarm filter settings
 */
export function useAlarmFilter() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['alarm-filter'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return alarmsAPI.getAlarmFilter(token);
    },
    enabled: !!token,
  });
}
