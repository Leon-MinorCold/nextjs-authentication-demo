'use client';

import { useEffect } from 'react';
import useUserStore from '@/store/useUserStore';

export default function UserInitializer() {
  const { setUser, user } = useUserStore();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // 只有在没有用户数据时才获取
        if (!user) {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const { data } = await response.json();
            setUser({
              id: data.id,
              email: data.email,
              username: data.username,
              role: data.role,
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, [setUser, user]);

  return null;
}
