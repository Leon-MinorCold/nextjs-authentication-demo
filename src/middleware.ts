import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from '@/lib/jwt';

// 定义路由权限配置
const routeConfig = {
  // 公开路由 - 无需认证
  public: ['/login', '/register', '/', '/about'],

  // 需要认证的路由
  protected: ['/dashboard', '/profile'],

  // 需要管理员权限的路由
  admin: ['/admin'],

  // API 路由配置
  api: {
    public: ['/api/auth/login', '/api/auth/register'],
    protected: ['/api/users'],
    admin: ['/api/admin'],
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路由
  if (
    routeConfig.public.some(route => pathname.startsWith(route)) ||
    routeConfig.api.public.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // 获取 access_token
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // 处理 refresh token 逻辑
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      // API 路由返回 401，页面路由重定向到登录
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    try {
      // Refresh token 验证和处理逻辑...
      // ... 之前的 refresh token 处理代码 ...
    } catch (error) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  try {
    // 验证 access token
    if (!accessToken) {
      throw new Error('No token provided');
    }
    const payload = await JWT.verifyAccessToken(accessToken);
    if (!payload) {
      throw new Error('Invalid token');
    }

    // 检查管理员路由权限
    if (
      (routeConfig.admin.some(route => pathname.startsWith(route)) ||
        routeConfig.api.admin.some(route => pathname.startsWith(route))) &&
      payload.role !== 'admin'
    ) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
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
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
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
