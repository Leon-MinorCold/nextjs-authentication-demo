import { db } from '@/db/config'
import { users } from '@/db/schema'
import { registerSchema } from '@/types/user'
import { genSalt, hash } from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { JWT } from '@/lib/jwt'
import { BusinessCode, HttpCode, createApiResponse, createErrorResponse } from '@/types/api'

export async function POST(req: Request) {
	try {
		const body = await req.json()

		// 验证请求数据
		const validatedData = registerSchema.parse(body)

		// 检查邮箱或用户名是否已存在
		const existingUser = await db
			.select()
			.from(users)
			.where(or(eq(users.email, validatedData.email), eq(users.username, validatedData.username)))
			.limit(1)

		if (existingUser.length > 0) {
			return NextResponse.json(
				createErrorResponse(BusinessCode.USER_ALREADY_EXISTS, '用户名或邮箱已被注册'),
				{ status: HttpCode.BAD_REQUEST }
			)
		}

		// 生成 salt 和加密密码
		const salt = await genSalt(12)
		const hashedPassword = await hash(validatedData.password, salt)

		// 创建新用户
		const [newUser] = await db
			.insert(users)
			.values({
				username: validatedData.username,
				email: validatedData.email,
				password: hashedPassword,
				salt: salt,
			})
			.returning({
				id: users.id,
				username: users.username,
				email: users.email,
				role: users.role,
				createdAt: users.createdAt,
			})

		// 生成 access token 和 refresh token
		const accessToken = await JWT.signAccessToken({
			id: newUser.id,
			email: newUser.email,
			username: newUser.username,
			role: newUser.role,
		})

		const refreshToken = await JWT.signRefreshToken({
			id: newUser.id,
			email: newUser.email,
			username: newUser.username,
			role: newUser.role,
		})

		// 创建响应
		const response = NextResponse.json(
			createApiResponse(
				{
					user: newUser,
					accessToken,
				},
				BusinessCode.SUCCESS,
				'注册成功'
			),
			{ status: HttpCode.CREATED }
		)

		// 设置 cookies
		response.cookies.set('access_token', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 15 * 60, // 15分钟
			path: '/',
		})

		response.cookies.set('refresh_token', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60, // 7天
			path: '/',
		})

		return response
	} catch (error) {
		console.error('Registration error:', error)
		return NextResponse.json(createErrorResponse(BusinessCode.FAIL, '注册失败，请稍后重试'), {
			status: HttpCode.INTERNAL_SERVER_ERROR,
		})
	}
}
