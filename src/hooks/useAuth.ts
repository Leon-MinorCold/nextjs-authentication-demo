import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { LoginInput, RegisterInput } from '@/types/user'
import { useRouter, useSearchParams } from 'next/navigation'
import useUserStore from '@/store/useUserStore'
import { getMe, login, logout, register } from '@/services/auth'
import { useToast } from '@/hooks/use-toast'

export function useLogin() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const setUser = useUserStore(state => state.setUser)
	const queryClient = useQueryClient()
	const { toast } = useToast()

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

			toast({
				title: '登录成功, 正在跳转...',
			})

			router.refresh()
		},
	})
}

export function useRegister() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const setUser = useUserStore(state => state.setUser)
	const queryClient = useQueryClient()
	const { toast } = useToast()

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

			toast({
				title: '注册成功, 正在跳转...',
				variant: 'default',
			})

			router.refresh()
		},
	})
}

export function useLogout() {
	const router = useRouter()
	const { logout: storeLogout, setLoggingOut } = useUserStore()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return useMutation({
		mutationFn: async () => {
			setLoggingOut(true)
			return logout()
		},
		onSuccess: () => {
			storeLogout()
			queryClient.removeQueries({ queryKey: ['user'] })
			toast({
				title: '注销成功',
			})
			router.replace('/login')
			router.refresh()
		},
	})
}

export function useUser(options = {}) {
	return useQuery({
		queryKey: ['user'],
		queryFn: getMe,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
		gcTime: 10 * 60 * 1000, // 改用 gcTime 替代 cacheTime
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		refetchOnReconnect: true,
		...options,
	})
}
