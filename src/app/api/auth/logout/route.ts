import { NextResponse } from 'next/server'
import { BusinessCode, HttpCode, createApiResponse } from '@/types/api'
import { JWT } from '@/lib/jwt'

export async function POST() {
	try {
		// 创建响应对象
		const response = NextResponse.json(createApiResponse(null, BusinessCode.SUCCESS, '登出成功'), {
			status: HttpCode.OK,
		})

		// clear cookie
		JWT.logout(response)

		// 清除请求头
		const headers = new Headers(response.headers)
		headers.delete('x-user-id')
		headers.delete('x-user-role')

		return response
	} catch (error) {
		console.error('Logout error:', error)
		return NextResponse.json(createApiResponse(null, BusinessCode.SUCCESS, '登出成功'), {
			status: HttpCode.OK,
		})
	}
}
