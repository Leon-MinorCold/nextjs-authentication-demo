import { QueryClient } from '@tanstack/react-query'

export const reactQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 全局配置
			staleTime: 60 * 1000, // 1分钟内数据被认为是新鲜的
			retry: 1, // 失败重试次数
			refetchOnWindowFocus: false, // 窗口聚焦时不重新请求
		},
	},
})
