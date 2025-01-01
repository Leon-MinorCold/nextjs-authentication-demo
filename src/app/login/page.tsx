'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  Button,
  Input,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from '@/components/ui';
import { RegisterInput, registerSchema } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { useForm } from 'react-hook-form';

const Page = () => {
  const [isLogin, setIsLogin] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    // TODO: Implement register logic

    console.log({ values });
  };

  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <CardTitle>{isLogin ? 'Login' : 'Create an account'}</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="输入用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="输入邮箱" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input placeholder="输入密码" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <Input placeholder="再次输入密码" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              注册
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          已经有账号了？<span className="underline">Login</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Page;
