import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { login, register, logout, user, token, isLoading, error, clearError } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await login(email, password);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Parameters<typeof register>[0]) => {
      await register(data);
    },
  });

  return {
    user,
    token,
    error: loginMutation.error ? (loginMutation.error as Error).message : (registerMutation.error ? (registerMutation.error as Error).message : error),
    isLoading: loginMutation.isPending || registerMutation.isPending || isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    clearError,
  };
}
