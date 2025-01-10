'use client'

import useUserStore from '@/store/useUserStore'
import UserDashboard from '@/app/dashboard/UserDashboard'
import AdminDashboard from '@/app/dashboard/AdminDashboard'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Button,
} from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/useAuth'

const Dashboard = () => {
	const router = useRouter()
	const { mutate: logoutMutate } = useLogout()
	const { user } = useUserStore()
	const isAdmin = user?.role === 'admin'

	const goLogin = () => router.push('/login')
	const goProfile = () => router.push('/profile')

	return (
		<Card className="w-[450px]">
			<CardHeader>
				<CardTitle>Welcome to Dashboard</CardTitle>
				<CardDescription>
					Hello, {user?.username}-{isAdmin ? 'Admin user' : 'user'}
				</CardDescription>
			</CardHeader>

			<CardContent>{isAdmin ? <AdminDashboard /> : <UserDashboard />}</CardContent>
			<CardFooter className="flex justify-between">
				<Button onClick={goLogin}>Go back to login</Button>
				<Button onClick={() => logoutMutate()}>logout</Button>
				<Button onClick={goProfile}>Check your info</Button>
			</CardFooter>
		</Card>
	)
}

export default Dashboard
