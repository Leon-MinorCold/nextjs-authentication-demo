'use client'

import { useEffect } from 'react'
import useUserStore from '@/store/useUserStore'
import { useUser } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { routeUtils } from '@/lib/route'

export default function UserInitializer() {
	const pathname = usePathname()
	const { setUser, user: storeUser } = useUserStore()
	const queryClient = useQueryClient()

	// 检查当前路由是否是公开路由
	const isPublicRoute = routeUtils.isPublicRoute(pathname)

	// Tip: 用户在保护路由和管理员路由下才查询，并且在用户未注销时
	const {
		data: user,
		isError,
		error,
		isFetched,
		refetch,
	} = useUser({
		enabled: !isPublicRoute,
	})

	// 请求完成后设置为初始化完成
	useEffect(() => {
		if (!isPublicRoute && isFetched) {
			if (user) {
				setUser(user)
				queryClient.setQueryData(['user'], user)
			} else if (isError) {
				setUser(null)
			}
		}
	}, [user, isFetched, error, isError, isPublicRoute, setUser, queryClient])

	// 监听 store 中的用户状态变化
	// useEffect(() => {
	// 	if (!storeUser) {
	// 		// 如果 store 中的用户被清除（比如登出），清除 React Query 缓存
	// 		queryClient.setQueryData(['user'], null)
	// 	}
	// }, [storeUser, queryClient])

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

	return null
}
