import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';
import { HttpCode } from '@/types/api';

interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// 创建 axios 实例
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    // 处理 Axios 错误
    const data = error.response?.data as ApiError | undefined;
    const status = error.response?.status;

    // 如果是 401 未授权错误，不显示 toast
    if (status === HttpCode.UNAUTHORIZED) {
      return Promise.reject(data || { message: '未登录' });
    }

    // 使用服务器返回的错误信息
    if (data?.message) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: data.message,
      });
      return Promise.reject(data);
    }

    // 处理表单验证错误
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0]?.[0];
      if (firstError) {
        toast({
          variant: 'destructive',
          title: '验证错误',
          description: firstError,
        });
        return Promise.reject({ message: firstError });
      }
    }

    // 处理 HTTP 状态码错误
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      403: '拒绝访问',
      404: '请求的资源不存在',
      500: '服务器错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    };

    const message = statusMessages[status || 0] || '请求失败';

    toast({
      variant: 'destructive',
      title: '错误',
      description: message,
    });

    return Promise.reject({ message });
  }
);

// 封装请求方法
export const request = {
  get<T = any>(url: string, config = {}) {
    return http.get<T, T>(url, config);
  },

  post<T = any>(url: string, data = {}, config = {}) {
    return http.post<T, T>(url, data, config);
  },

  put<T = any>(url: string, data = {}, config = {}) {
    return http.put<T, T>(url, data, config);
  },

  delete<T = any>(url: string, config = {}) {
    return http.delete<T, T>(url, config);
  },

  patch<T = any>(url: string, data = {}, config = {}) {
    return http.patch<T, T>(url, data, config);
  },
};

export default http;
