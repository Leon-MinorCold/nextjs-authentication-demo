import { db, supabase } from '@/db/config';
import { users } from '@/db/schema';
import { loginSchema } from '@/types/user';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();


    console.log('bababababa',body)
    
    // 验证请求数据
    const validatedData = loginSchema.parse(body);
    
    // 查找用户
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));

    if (!user) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 400 }
      );
    }

    // 使用存储的 salt 和输入的密码生成哈希值
    const hashedPassword = await hash(validatedData.password, user.salt);

    // 比较生成的哈希值与存储的密码
    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 400 }
      );
    }

    // 使用 supabase 创建会话
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { message: '登录失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 创建响应对象
    const response = NextResponse.json(
      {
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        session: authData.session,
      },
      { status: 200 }
    );

    // 设置 Cookie
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
