import axios from 'axios'
import { cookies } from 'next/headers'

// 创建 Axios 实例
const serverReq = axios.create({
	baseURL: 'http://localhost:3000/api' || '/api', // 确保你在环境变量中设置了 API URL
	timeout: 10000,
})

// 请求拦截器
serverReq.interceptors.request.use(async config => {
	// 获取服务端 cookie
	const cookieStore = await cookies()
	const accessToken = cookieStore.get('access_token')?.value
	const refreshToken = cookieStore.get('refresh_token')?.value

	// 构建 Cookie 字符串
	const cookieString = []
	if (accessToken) {
		cookieString.push(`access_token=${accessToken}`)
	}
	if (refreshToken) {
		cookieString.push(`refresh_token=${refreshToken}`)
	}

	// 将 cookie 添加到请求头
	if (cookieString.length > 0) {
		config.headers.Cookie = cookieString.join('; ') // 将 cookie 连接成字符串
	}

	return config
})

// 响应拦截器
serverReq.interceptors.response.use(
	response => response.data.data, // 直接返回数据
	error => {
		console.error('Server request error:', error)
		throw new Error(error.response?.data?.message || 'Server request failed')
	}
)

// 服务端请求方法
export const serverRequest = {
	get: <T>(url: string) => serverReq.get<any, T>(url),
	post: <T>(url: string, data?: any) => serverReq.post<any, T>(url, data),
	put: <T>(url: string, data?: any) => serverReq.put<any, T>(url, data),
	delete: <T>(url: string) => serverReq.delete<any, T>(url),
}
