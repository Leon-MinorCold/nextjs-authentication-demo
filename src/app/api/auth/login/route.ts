import { db } from '@/db/config';
import { users } from '@/db/schema';
import { loginSchema } from '@/types/user';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { JWT } from '@/lib/jwt';
import { BusinessCode, HttpCode, createApiResponse, createErrorResponse } from '@/types/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validatedData = loginSchema.parse(body);

    // 查找用户
    const [user] = await db.select().from(users).where(eq(users.email, validatedData.email));

    if (!user) {
      return NextResponse.json(createErrorResponse(BusinessCode.USER_NOT_FOUND, '邮箱或密码错误'), {
        status: HttpCode.BAD_REQUEST,
      });
    }

    // 使用存储的 salt 和输入的密码生成哈希值
    const hashedPassword = await hash(validatedData.password, user.salt);

    // 比较生成的哈希值与存储的密码
    if (hashedPassword !== user.password) {
      return NextResponse.json(
        createErrorResponse(BusinessCode.INVALID_PASSWORD, '邮箱或密码错误'),
        { status: HttpCode.BAD_REQUEST }
      );
    }

    // 生成 tokens
    const accessToken = await JWT.signAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshToken = await JWT.signRefreshToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 创建响应对象
    const response = NextResponse.json(
      createApiResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          accessToken,
        },
        BusinessCode.SUCCESS,
        '登录成功'
      ),
      { status: HttpCode.OK }
    );

    // 设置 cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15分钟
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(createErrorResponse(BusinessCode.FAIL, '登录失败，请稍后重试'), {
      status: HttpCode.INTERNAL_SERVER_ERROR,
    });
  }
}
