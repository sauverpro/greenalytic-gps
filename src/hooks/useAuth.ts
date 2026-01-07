import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api';
import { useAuthStore } from '../stores';
import type { LoginType, Language } from '../types';

/**
 * Hook for login mutation (JSONP API)
 */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loginName,
      loginPassword,
    }: {
      loginName: string;
      loginPassword: string;
      loginType?: LoginType;
      language?: Language;
    }) => authAPI.login(loginName, loginPassword),
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        setAuth(
          {
            id: data.user.id,
            loginType: 'ENTERPRISE',
            grade: 0,
            role: data.user.role || 'user',
            username: data.user.username,
            name: data.user.name,
            email: data.user.email,
          },
          data.token // Use actual JWT token
        );
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

/**
 * Hook for changing account password
 */
export function useChangeAccountPassword() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({
      newPassword,
      oldPassword,
      ismd5,
    }: {
      newPassword: string;
      oldPassword: string;
      ismd5?: number;
    }) => {
      if (!token) throw new Error('No token found');
      return authAPI.changeAccountPassword(token, newPassword, oldPassword, ismd5);
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegisterUser() {
  return useMutation({
    mutationFn: ({
      macid,
      loginName,
      password,
      repassword,
    }: {
      macid: string;
      loginName: string;
      password: string;
      repassword: string;
    }) => authAPI.registerUser(macid, loginName, password, repassword),
  });
}
