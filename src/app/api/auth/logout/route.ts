import { NextResponse } from 'next/server';
import { BusinessCode, HttpCode, createApiResponse } from '@/types/api';

export async function POST() {
  try {
    // 创建响应对象
    const response = NextResponse.json(createApiResponse(null, BusinessCode.SUCCESS, '登出成功'), {
      status: HttpCode.OK,
    });

    // 清除所有认证相关的 cookies，设置为过期
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/',
    });

    // 清除请求头
    const headers = new Headers(response.headers);
    headers.delete('x-user-id');
    headers.delete('x-user-role');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(createApiResponse(null, BusinessCode.SUCCESS, '登出成功'), {
      status: HttpCode.OK,
    });
  }
}
