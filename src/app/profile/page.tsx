import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { JWT } from '@/lib/jwt'
import { serverRequest } from '@/lib/server-request'
import { UserInfo } from '@/types/user'
import { db } from '@/db/config'
import { users } from '@/db/schema'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'

export default async function Page() {
	const cookieStore = await cookies()
	const payload = await JWT.verifyAccessToken(cookieStore.get('access_token')?.value)

	if (!payload) {
		return (
			<Card>
				<CardContent>
					<p className="text-red-500">未登录，请先登录。</p>
				</CardContent>
			</Card>
		)
	}

	const user = await serverRequest.get<UserInfo>('/auth/me')

	const [dbUser] = await db
		.select({
			id: users.id,
			email: users.email,
			username: users.username,
			role: users.role,
		})
		.from(users)
		.where(eq(users.id, payload.id))

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-muted-foreground">Username</p>
						<p className="font-medium">{user.username}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Email</p>
						<p className="font-medium">{user.email}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Role</p>
						<p className="font-medium capitalize">{user.role}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
