'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui'
import { useEffect, useState } from 'react'

import RegisterForm from '@/app/login/RegisterForm'
import LoginForm from '@/app/login/LoginForm'
import useUserStore from '@/store/useUserStore'
import { useRouter } from 'next/navigation'

const Page = () => {
	const router = useRouter()
	const [isLogin, setIsLogin] = useState(true)
	const { isAuthenticated } = useUserStore()

	// 使用 useEffect 处理重定向
	useEffect(() => {
		if (isAuthenticated) {
			router.push('/dashboard')
		}
	}, [isAuthenticated, router])

	// 如果已认证，返回 null 避免闪烁
	if (isAuthenticated) {
		return null
	}

	return (
		<Card className="w-[350px]">
			<CardHeader className="text-center">
				<CardTitle>{isLogin ? 'Login' : 'Create an account'}</CardTitle>
				<CardDescription>Enter your information to get started</CardDescription>
			</CardHeader>
			<CardContent>{isLogin ? <LoginForm /> : <RegisterForm />}</CardContent>

			<CardFooter className="flex items-center justify-center">
				<p
					className="text-sm text-muted-foreground cursor-pointer"
					onClick={() => setIsLogin(!isLogin)}
				>
					{isLogin ? (
						'Create an account'
					) : (
						<span>
							已经有账号了？<span className="underline">Login</span>
						</span>
					)}
				</p>
			</CardFooter>
		</Card>
	)
}

export default Page
