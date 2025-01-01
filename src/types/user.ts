import * as z from 'zod';

// 基础的用户验证 schema
export const userSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
});

// 注册表单的验证 schema
export const registerSchema = userSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword'],
  });

// 登录表单的验证 schema
export const loginSchema = z.object({
  email: userSchema.shape.email,
  password: userSchema.shape.password,
});

// 导出类型
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type { User, NewUser } from '@/db/schema';
