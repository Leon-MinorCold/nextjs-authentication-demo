'use client'

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { LoginInput, RegisterInput } from '@/types/user'
import { useRouter, useSearchParams } from 'next/navigation'
import useUserStore from '@/store/useUserStore'
import { getMe, login, logout, register } from '@/services/auth'
import { toast } from 'sonner'

export function useLogin() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const setUser = useUserStore(state => state.setUser)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: LoginInput) => login(data),
		onSuccess: response => {
			// 更新用户状态
			setUser(response.user)

			// 更新缓存中的用户数据
			queryClient.setQueryData(['user'], response.user)
			// 获取重定向 URL
			const redirect = searchParams.get('redirect')

			// 如果有重定向参数，跳转到指定页面，否则跳转到仪表板
			if (redirect) {
				router.push(decodeURIComponent(redirect))
			} else {
				router.push('/dashboard')
			}

			toast.success('登录成功')
			router.refresh()
		},
	})
}

export function useRegister() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const setUser = useUserStore(state => state.setUser)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: RegisterInput) => register(data),
		onSuccess: response => {
			setUser(response.user)
			queryClient.setQueryData(['user'], response.user)
			const redirect = searchParams.get('redirect')

			// 如果有重定向参数，跳转到指定页面，否则跳转到仪表板
			if (redirect) {
				router.push(decodeURIComponent(redirect))
			} else {
				router.push('/dashboard')
			}

			toast.success('注册成功')

			router.refresh()
		},
	})
}

export function useLogout() {
	const router = useRouter()
	const { logout: storeLogout } = useUserStore()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			storeLogout()

			// Todo: 这里不知道为啥执行之后会报错
			queryClient.setQueryData(['user'], null)

			toast.success('注销成功')
			router.replace('/login')
			router.refresh()
		},
	})
}

export function useUser(options = {}) {
	return useQuery({
		queryKey: ['user'],
		queryFn: getMe,
		// retry: false,
		// staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
		// gcTime: 10 * 60 * 1000, // 改用 gcTime 替代 cacheTime
		// refetchOnWindowFocus: true,
		// refetchOnMount: true,
		// refetchOnReconnect: true,
		...options,
	})
}
