import {
	Form,
	Button,
	Input,
	FormField,
	FormLabel,
	FormControl,
	FormItem,
	FormMessage,
} from '@/components/ui'
import { loginSchema, LoginInput } from '@/types/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLogin } from '@/hooks/useAuth'

const LoginForm = () => {
	const { mutate, isPending } = useLogin()
	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: LoginInput) => {
		try {
			mutate(data)
		} catch (error) {
			console.error('Registration failed:', error)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>邮箱</FormLabel>
							<FormControl>
								<Input placeholder="输入邮箱" type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>密码</FormLabel>
							<FormControl>
								<Input placeholder="输入密码" type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isPending} loading={isPending}>
					Login
				</Button>
			</form>
		</Form>
	)
}

export default LoginForm
