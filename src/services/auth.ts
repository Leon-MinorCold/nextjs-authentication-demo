import { request } from '@/lib/request';
import { LoginInput, RegisterInput, UserInfo } from '@/types/user';

export const register = (data: RegisterInput): Promise<{ user: UserInfo }> =>
  request.post('/auth/register', data);

export const login = (data: LoginInput): Promise<{ user: UserInfo; accessToken?: string }> =>
  request.post('/auth/login', data);

export const logout = (): Promise<void> => request.post('/auth/logout');

export const getMe = (): Promise<UserInfo> => request.get('/auth/me');
