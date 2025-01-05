import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { LoginInput, RegisterInput } from '@/types/user';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/useUserStore';
import { getMe, login, logout, register } from '@/services/auth';

export function useLogin() {
  const router = useRouter();
  const setUser = useUserStore(state => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: response => {
      // 更新用户状态
      setUser(response.user);
      // 更新缓存中的用户数据
      queryClient.setQueryData(['user'], response.user);
      // 重定向到仪表板
      router.push('/dashboard');
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useUserStore(state => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: response => {
      
      setUser(response.user);
      queryClient.setQueryData(['user'], response.user);
      router.push('/dashboard');
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const setUser = useUserStore(state => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.removeQueries({ queryKey: ['user'] });
      router.push('/login');
      router.refresh();
    },
  });
}

export function useUser(options = {}) {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 改用 gcTime 替代 cacheTime
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...options,
  });
}
