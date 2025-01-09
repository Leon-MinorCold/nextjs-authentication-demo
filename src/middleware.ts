import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWT } from '@/lib/jwt'
import { BusinessCode, HttpCode, createErrorResponse } from '@/types/api'
import { routeUtils } from '@/lib/route'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	const isApiRoute = routeUtils.isApiRoute(pathname)
	const isAdminRoute = routeUtils.isAdminRoute(pathname)
	const isProtectedRoute = routeUtils.isProtectedRoute(pathname)
	const isPublicRoute = routeUtils.isPublicRoute(pathname)
	const isLoginRoute = routeUtils.isLoginRoute(pathname)
	const accessToken = request.cookies.get('access_token')?.value
	const refreshToken = request.cookies.get('refresh_token')?.value

	// 1. 如果当前用户已登录并想跳转到/login页则直接跳转到主页
	if (isLoginRoute && accessToken) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// 2. 检查是否是公开路由
	if (isPublicRoute) {
		return NextResponse.next()
	}

	// 3. 校验 accessToken 和  refreshToken 是否存在
	// 3.1 并且重复生成 refresh_token 保证用户一直处于登录状态
	if (!accessToken) {
		if (!refreshToken) {
			// API 路由返回统一格式的错误响应
			if (isApiRoute) {
				return NextResponse.json(createErrorResponse(BusinessCode.UNAUTHORIZED, '未登录'), {
					status: HttpCode.UNAUTHORIZED,
				})
			}
			return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
		}

		try {
			// 验证 refresh token
			const payload = await JWT.verifyRefreshToken(refreshToken)
			if (!payload) {
				if (isApiRoute) {
					return NextResponse.json(
						createErrorResponse(BusinessCode.TOKEN_EXPIRED, 'refresh token 已过期'),
						{ status: HttpCode.UNAUTHORIZED }
					)
				}
				return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
			}
		} catch (error) {
			if (isApiRoute) {
				return NextResponse.json(
					createErrorResponse(BusinessCode.INVALID_TOKEN, 'refresh token 无效'),
					{ status: HttpCode.UNAUTHORIZED }
				)
			}
			return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
		}
	}

	// 4. 检查用户的 accessToken 是否合法
	try {
		// 验证 access token
		const payload = await JWT.verifyAccessToken(accessToken)
		if (!payload) {
			if (isApiRoute) {
				return NextResponse.json(
					createErrorResponse(BusinessCode.TOKEN_EXPIRED, 'access token 已过期'),
					{ status: HttpCode.UNAUTHORIZED }
				)
			}
			return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
		}

		if (isAdminRoute && payload.role !== 'admin') {
			if (isApiRoute) {
				return NextResponse.json(
					createErrorResponse(BusinessCode.NO_PERMISSION, '需要管理员权限'),
					{ status: HttpCode.FORBIDDEN }
				)
			}
			return NextResponse.redirect(new URL('/unauthorized', request.url))
		}

		if (isProtectedRoute && !payload.role) {
			if (isApiRoute) {
				return NextResponse.json(createErrorResponse(BusinessCode.NO_PERMISSION, '需要用户权限'), {
					status: HttpCode.FORBIDDEN,
				})
			}
			// Todo: 待补充 /unauthorized 路由
			return NextResponse.redirect(new URL('/unauthorized', request.url))
		}

		// 设置用户信息到请求头
		const requestHeaders = new Headers(request.headers)
		requestHeaders.set('x-user-id', payload.id.toString())
		requestHeaders.set('x-user-role', payload.role)

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		})
	} catch (error) {
		if (isApiRoute) {
			return NextResponse.json(
				createErrorResponse(BusinessCode.INVALID_TOKEN, 'access token 无效'),
				{ status: HttpCode.UNAUTHORIZED }
			)
		}
		return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
	}
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
