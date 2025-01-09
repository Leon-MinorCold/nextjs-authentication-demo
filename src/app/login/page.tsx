'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui'
import { Suspense, useState } from 'react'

import RegisterForm from '@/app/login/RegisterForm'
import LoginForm from '@/app/login/LoginForm'

const Page = () => {
	const [isLogin, setIsLogin] = useState(true)

	return (
		<Card className="w-[350px]">
			<CardHeader className="text-center">
				<CardTitle>{isLogin ? 'Login' : 'Create an account'}</CardTitle>
				<CardDescription>Enter your information to get started</CardDescription>
			</CardHeader>
			<CardContent>
				<Suspense>{isLogin ? <LoginForm /> : <RegisterForm />}</Suspense>
			</CardContent>

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
