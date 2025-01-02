import { request } from '@/lib/request';
import { LoginInput, RegisterInput, User } from '@/types/user';

export const register = (data: RegisterInput): Promise<User> =>
  request.post('/auth/register', data);

export const login = (data: LoginInput): Promise<User> => request.post('/auth/login', data);
