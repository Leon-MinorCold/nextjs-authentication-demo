import { db } from '@/db/config';
import { users } from '@/db/schema';
import { registerSchema } from '@/types/user';
import { genSalt, hash } from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validatedData = registerSchema.parse(body);

    // 检查邮箱或用户名是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, validatedData.email), eq(users.username, validatedData.username)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ message: '用户名或邮箱已被注册' }, { status: 400 });
    }

    // 生成 salt
    const salt = await genSalt(12);
    // 使用 salt 和密码生成加密密码
    const hashedPassword = await hash(validatedData.password, salt);

    // 创建新用户
    const [newUser] = await db
      .insert(users)
      .values({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        salt,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        message: '注册成功',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: '注册失败，请稍后重试' }, { status: 500 });
  }
}
