import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from '@/lib/jwt';
import { BusinessCode, HttpCode, createErrorResponse } from '@/types/api';
import { routeConfig, routeUtils } from '@/lib/route';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路由
  if (routeUtils.isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 获取 access_token
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // 尝试获取 refresh_token
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      // API 路由返回统一格式的错误响应
      if (routeUtils.isApiRoute(pathname)) {
        return NextResponse.json(createErrorResponse(BusinessCode.UNAUTHORIZED, '未登录'), {
          status: HttpCode.UNAUTHORIZED,
        });
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    try {
      // 验证 refresh token
      const payload = await JWT.verifyRefreshToken(refreshToken);
      if (!payload) {
        if (routeUtils.isApiRoute(pathname)) {
          return NextResponse.json(
            createErrorResponse(BusinessCode.TOKEN_EXPIRED, 'refresh token 已过期'),
            { status: HttpCode.UNAUTHORIZED }
          );
        }
        return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
      }
    } catch (error) {
      if (routeUtils.isApiRoute(pathname)) {
        return NextResponse.json(
          createErrorResponse(BusinessCode.INVALID_TOKEN, 'refresh token 无效'),
          { status: HttpCode.UNAUTHORIZED }
        );
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
  }

  try {
    // 验证 access token
    const payload = await JWT.verifyAccessToken(accessToken);
    if (!payload) {
      if (routeUtils.isApiRoute(pathname)) {
        return NextResponse.json(
          createErrorResponse(BusinessCode.TOKEN_EXPIRED, 'access token 已过期'),
          { status: HttpCode.UNAUTHORIZED }
        );
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    // 检查管理员路由权限
    const isAdminRoute =
      routeConfig.admin.some(route => pathname.startsWith(route)) ||
      routeConfig.api.admin.some(route => pathname.startsWith(route));

    if (isAdminRoute && payload.role !== 'admin') {
      if (routeUtils.isApiRoute(pathname)) {
        return NextResponse.json(
          createErrorResponse(BusinessCode.NO_PERMISSION, '需要管理员权限'),
          { status: HttpCode.FORBIDDEN }
        );
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // 检查受保护路由权限
    const isProtectedRoute =
      routeConfig.protected.some(route => pathname.startsWith(route)) ||
      routeConfig.api.protected.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !payload.role) {
      if (routeUtils.isApiRoute(pathname)) {
        return NextResponse.json(createErrorResponse(BusinessCode.NO_PERMISSION, '需要用户权限'), {
          status: HttpCode.FORBIDDEN,
        });
      }
      // Todo: 待补充 /unauthorized 路由
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // 设置用户信息到请求头
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id.toString());
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (routeUtils.isApiRoute(pathname)) {
      return NextResponse.json(
        createErrorResponse(BusinessCode.INVALID_TOKEN, 'access token 无效'),
        { status: HttpCode.UNAUTHORIZED }
      );
    }
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
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
};
