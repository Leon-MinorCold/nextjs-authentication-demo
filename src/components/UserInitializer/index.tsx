'use client';

import { useEffect } from 'react';
import useUserStore from '@/store/useUserStore';
import { useUser } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/login'];

export default function UserInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, user: storeUser } = useUserStore();
  const queryClient = useQueryClient();

  // 检查当前路由是否是公开路由
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 使用 useUser hook 获取用户信息
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useUser({
    enabled: !isPublicRoute, // 只在非公开路由中启用查询
  });

  // 初始化和状态同步
  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // 如果获取到用户信息，更新状态
      setUser(user);
      queryClient.setQueryData(['user'], user);
    } else if (isError) {
      // 如果发生错误，清除状态
      setUser(null);
      queryClient.setQueryData(['user'], null);

      // Todo: 处理特定错误
      // if (error?.response?.status === 401) {
      //   // 未登录状态，可以选择重定向到登录页
      //   // router.push('/login');
      //   console.log('User not authenticated');
      // }
    }
  }, [user, isLoading, isError, error, setUser, queryClient]);

  // 监听 store 中的用户状态变化
  useEffect(() => {
    if (!storeUser) {
      // 如果 store 中的用户被清除（比如登出），清除 React Query 缓存
      queryClient.setQueryData(['user'], null);
    }
  }, [storeUser, queryClient]);

  // 定期刷新用户信息
  useEffect(() => {
    // 每 5 分钟刷新一次用户信息
    const interval = setInterval(
      () => {
        if (storeUser) {
          refetch();
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [storeUser, refetch]);

  // 监听窗口焦点变化
  // useEffect(() => {
  //   const handleFocus = () => {
  //     // 当窗口重新获得焦点时，刷新用户信息
  //     if (storeUser) {
  //       refetch();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [storeUser, refetch]);

  // 可以根据需要返回加载状态
  if (isLoading) {
    return null; // 或者返回加载指示器
  }

  return null;
}
