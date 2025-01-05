// 路由配置类型定义
export interface RouteConfig {
  // 页面路由
  public: string[]; // 公开路由
  protected: string[]; // 需要登录的路由
  admin: string[]; // 需要管理员权限的路由

  // API 路由
  api: {
    public: string[]; // 公开 API
    protected: string[]; // 需要登录的 API
    admin: string[]; // 需要管理员权限的 API
  };
}

// 全局路由配置
export const routeConfig: RouteConfig = {
  // 页面路由 - 无需认证
  public: ['/login', '/register', '/forgot-password', '/reset-password', '/about'],

  // 需要用户登录的路由
  protected: ['/dashboard', '/profile', '/settings', '/orders', '/notifications', '/'],

  // 需要管理员权限的路由
  admin: ['/admin', '/admin/users', '/admin/settings', '/admin/orders'],

  // API 路由配置
  api: {
    // 公开 API
    public: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ],

    // 需要用户登录的 API
    protected: ['/api/user', '/api/user/profile', '/api/orders', '/api/notifications'],

    // 需要管理员权限的 API
    admin: ['/api/admin/users', '/api/admin/settings', '/api/admin/orders'],
  },
};

// 路由检查工具函数
export const routeUtils = {
  // 检查是否是公开路由
  isPublicRoute: (pathname: string): boolean => {
    return (
      routeConfig.public.some(route => pathname.startsWith(route)) ||
      routeConfig.api.public.some(route => pathname.startsWith(route))
    );
  },

  // 检查是否是受保护路由
  isProtectedRoute: (pathname: string): boolean => {
    return (
      routeConfig.protected.some(route => pathname.startsWith(route)) ||
      routeConfig.api.protected.some(route => pathname.startsWith(route))
    );
  },

  // 检查是否是管理员路由
  isAdminRoute: (pathname: string): boolean => {
    return (
      routeConfig.admin.some(route => pathname.startsWith(route)) ||
      routeConfig.api.admin.some(route => pathname.startsWith(route))
    );
  },

  // 检查是否是 API 路由
  isApiRoute: (pathname: string): boolean => {
    return pathname.startsWith('/api');
  },

  // 获取重定向 URL
  getRedirectUrl: (pathname: string): string => {
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  },
};
