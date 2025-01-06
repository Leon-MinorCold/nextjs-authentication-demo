import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/config'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { BusinessCode, HttpCode, createApiResponse, createErrorResponse } from '@/types/api'
import { JWT } from '@/lib/jwt'

export async function GET(req: NextRequest) {
	try {
		// 从 cookie 获取 access_token
		const accessToken = req.cookies.get('access_token')?.value

		if (!accessToken) {
			return NextResponse.json(createErrorResponse(BusinessCode.UNAUTHORIZED, '未登录'), {
				status: HttpCode.UNAUTHORIZED,
			})
		}

		// 验证 token
		const payload = await JWT.verifyAccessToken(accessToken)
		if (!payload) {
			return NextResponse.json(createErrorResponse(BusinessCode.UNAUTHORIZED, '登录已过期'), {
				status: HttpCode.UNAUTHORIZED,
			})
		}

		// 从请求头获取用户ID并验证与 token 中的 ID 是否匹配
		const userId = req.headers.get('x-user-id')
		if (!userId || parseInt(userId) !== payload.id) {
			return NextResponse.json(createErrorResponse(BusinessCode.UNAUTHORIZED, '用户信息不匹配'), {
				status: HttpCode.UNAUTHORIZED,
			})
		}

		// 查询用户信息
		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				username: users.username,
				role: users.role,
			})
			.from(users)
			.where(eq(users.id, payload.id))

		if (!user) {
			return NextResponse.json(createErrorResponse(BusinessCode.USER_NOT_FOUND, '用户不存在'), {
				status: HttpCode.NOT_FOUND,
			})
		}

		return NextResponse.json(createApiResponse(user, BusinessCode.SUCCESS, '获取用户信息成功'), {
			status: HttpCode.OK,
		})
	} catch (error) {
		console.error('Get user info error:', error)
		return NextResponse.json(createErrorResponse(BusinessCode.FAIL, '获取用户信息失败'), {
			status: HttpCode.INTERNAL_SERVER_ERROR,
		})
	}
}
