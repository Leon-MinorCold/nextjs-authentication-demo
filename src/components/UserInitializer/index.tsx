'use client'

import { useEffect } from 'react'
import useUserStore from '@/store/useUserStore'
import { useUser } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from 'next/navigation'
import { routeUtils } from '@/lib/route'

export default function UserInitializer() {
	const router = useRouter()
	const pathname = usePathname()
	const { setUser, user: storeUser, setInitialized } = useUserStore()
	const queryClient = useQueryClient()

	// 检查当前路由是否是公开路由
	const isPublicRoute = routeUtils.isPublicRoute(pathname)

	const {
		data: user,
		isLoading,
		isError,
		error,
		isFetched,
		refetch,
	} = useUser({
		enabled: !isPublicRoute, // 只在非公开路由中启用查询
	})

	// 如果是公开路由，直接标记为已初始化
	useEffect(() => {
		if (isPublicRoute) {
			setInitialized(true)
		}
	}, [isPublicRoute, setInitialized])

	// 请求完成后设置为初始化完成
	useEffect(() => {
		if (!isPublicRoute && isFetched) {
			if (user) {
				setUser(user)
				queryClient.setQueryData(['user'], user)
			} else if (isError) {
				setUser(null)
				queryClient.setQueryData(['user'], null)
				setInitialized(true)
				// Todo: 处理错误
				// if (error?.response?.status === 401) {
				//   // 未登录状态，可以选择重定向到登录页
				//   // router.push('/login');
				//   console.log('User not authenticated');
				// }
			}
		}
	}, [user, isFetched])

	// 监听 store 中的用户状态变化
	useEffect(() => {
		if (!storeUser) {
			// 如果 store 中的用户被清除（比如登出），清除 React Query 缓存
			queryClient.setQueryData(['user'], null)
		}
	}, [storeUser, queryClient])

	// 定期刷新用户信息
	useEffect(() => {
		// 每 5 分钟刷新一次用户信息
		const interval = setInterval(
			() => {
				if (storeUser) {
					refetch()
				}
			},
			5 * 60 * 1000
		)

		return () => clearInterval(interval)
	}, [storeUser, refetch])

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
		return null // 或者返回加载指示器
	}

	return null
}
