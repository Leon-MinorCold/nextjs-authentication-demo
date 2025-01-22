import { JWT } from '@/lib/jwt'
import { routeUtils } from '@/lib/route'
import { BusinessCode, createErrorResponse, HttpCode } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
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

	// 具体逻辑参考notion笔记
	if (!accessToken) {
		if (!refreshToken) {
			if (isProtectedRoute) {
				return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
			}
			return NextResponse.next()
		} else {
			try {
				const payload = await JWT.verifyRefreshToken(refreshToken)
				if (!payload) {
					if (isApiRoute) {
						return (
							NextResponse.json(
								createErrorResponse(BusinessCode.TOKEN_EXPIRED, 'refresh token 已过期')
							),
							{ status: HttpCode.UNAUTHORIZED }
						)
					}
					return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
				}
				const [newAccessToken, newRefreshToken] = await Promise.all([
					JWT.signAccessToken(payload),
					JWT.signRefreshToken(payload),
				])
				JWT.injectAccessCookie(NextResponse.next(), newAccessToken)
				JWT.injectRefreshCookie(NextResponse.next(), newRefreshToken)
				return NextResponse.next()
			} catch (e) {
				if (isApiRoute) {
					return NextResponse.json(
						createErrorResponse(BusinessCode.INVALID_TOKEN, 'refresh token 无效'),
						{ status: HttpCode.UNAUTHORIZED }
					)
				}
				return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
			}
		}
	} else {
		try {
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
					return NextResponse.json(
						createErrorResponse(BusinessCode.NO_PERMISSION, '需要用户权限'),
						{
							status: HttpCode.FORBIDDEN,
						}
					)
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
		} catch (e) {
			if (isApiRoute) {
				return NextResponse.json(
					createErrorResponse(BusinessCode.INVALID_TOKEN, 'access token 无效'),
					{ status: HttpCode.UNAUTHORIZED }
				)
			}
			return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
		}
	}
}
