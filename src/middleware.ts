import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { loggerMiddleware, authMiddleware } from '@/middlewares'

export async function middleware(request: NextRequest) {
	loggerMiddleware(request)

	loggerMiddleware(request)

	const authResponse = authMiddleware(request)
	if (authResponse) return authResponse

	return NextResponse.next()
}

// 配置中间件匹配的路由
export const config = {
	matcher: [
		/*
		 * 匹配所有路径，除了：
		 * /_next/static (静态文件)
		 * /_next/image (图片优化 API)
		 * /favicon.ico (浏览器图标)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
}
