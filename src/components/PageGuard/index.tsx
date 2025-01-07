'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useUserStore from '@/store/useUserStore'

interface PageGuardProps {
	children: React.ReactNode
	requireAuth?: boolean
	requireAdmin?: boolean
}

export default function PageGuard({
	children,
	requireAuth = true,
	requireAdmin = false,
}: PageGuardProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { isAuthenticated, user, isInitialized, isLoggingOut } = useUserStore()

	useEffect(() => {
		if (!isInitialized) return

		// 如果正在登出，不执行重定向
		if (isLoggingOut) return

		// 如果需要认证且用户未登录，重定向到登录页
		if (requireAuth && (!isAuthenticated || !user)) {
			router.push('/login')
			return
		}

		// 如果需要管理员权限但用户不是管理员
		if (requireAdmin && user?.role !== 'admin') {
			router.push('/dashboard') // 或其他未授权页面
			return
		}

		// 如果用户已登录且访问登录页，重定向到首页
		if (isAuthenticated && user && pathname === '/login') {
			router.push('/dashboard')
		}
	}, [isAuthenticated, user, router, pathname, requireAuth, requireAdmin, isInitialized])

	// 渲染子组件
	return <>{children}</>
}
