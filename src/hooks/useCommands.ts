import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commandsAPI } from '../api';
import { useAuthStore } from '../stores';

/**
 * Hook to send command to device
 */
export function useSendCommand() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      macid,
      cmd,
      param,
      pwd,
      sendTime,
    }: {
      macid: string;
      cmd: string;
      param?: string;
      pwd?: string;
      sendTime?: string;
    }) => {
      if (!token) throw new Error('No token found');
      return commandsAPI.sendCommand(token, macid, cmd, param, pwd, sendTime);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['command-history', variables.macid] });
    },
  });
}

/**
 * Hook to get command result
 */
export function useCommandResult(macid: string, cmdNo: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['command-result', macid, cmdNo],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return commandsAPI.getCommandResult(token, macid, cmdNo);
    },
    enabled: !!token && !!macid && !!cmdNo,
    refetchInterval: 3000, // Poll every 3 seconds until command completes
  });
}

/**
 * Hook to get command history
 */
export function useCommandHistory(macid: string, count?: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['command-history', macid, count],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return commandsAPI.getCommandHistory(token, macid, count);
    },
    enabled: !!token && !!macid,
  });
}

/**
 * Hook to clear commands
 */
export function useClearCommands() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (macid: string) => {
      if (!token) throw new Error('No token found');
      return commandsAPI.clearCommands(token, macid);
    },
    onSuccess: (_, macid) => {
      queryClient.invalidateQueries({ queryKey: ['command-history', macid] });
    },
  });
}

/**
 * Convenience hook to arm device
 */
export function useArmDevice() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ macid, pwd }: { macid: string; pwd?: string }) => {
      if (!token) throw new Error('No token found');
      return commandsAPI.armDevice(token, macid, pwd);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['command-history', variables.macid] });
    },
  });
}

/**
 * Convenience hook to disarm device
 */
export function useDisarmDevice() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ macid, pwd }: { macid: string; pwd?: string }) => {
      if (!token) throw new Error('No token found');
      return commandsAPI.disarmDevice(token, macid, pwd);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['command-history', variables.macid] });
    },
  });
}
