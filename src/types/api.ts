// HTTP 状态码枚举
export enum HttpCode {
	// 2xx 成功
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NO_CONTENT = 204,

	// 3xx 重定向
	MOVED_PERMANENTLY = 301,
	FOUND = 302,
	NOT_MODIFIED = 304,

	// 4xx 客户端错误
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,
	UNPROCESSABLE_ENTITY = 422,
	TOO_MANY_REQUESTS = 429,

	// 5xx 服务器错误
	INTERNAL_SERVER_ERROR = 500,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504,
}

// 业务状态码枚举
export enum BusinessCode {
	SUCCESS = 0,
	FAIL = -1,

	// 用户相关 1xxxx
	USER_NOT_FOUND = 10001,
	USER_ALREADY_EXISTS = 10002,
	INVALID_PASSWORD = 10003,
	INVALID_TOKEN = 10004,
	TOKEN_EXPIRED = 10005,

	// 权限相关 2xxxx
	NO_PERMISSION = 20001,
	ROLE_NOT_FOUND = 20002,

	// 数据相关 3xxxx
	DATA_NOT_FOUND = 30001,
	DATA_ALREADY_EXISTS = 30002,
	DATA_VALIDATION_FAILED = 30003,

	UNAUTHORIZED = 401,
}

// API 响应接口
export interface ApiResponse<T = any> {
	code: BusinessCode
	data: T | null
	message: string
	success: boolean
}

// 创建统一响应的工具函数
export const createApiResponse = <T>(
	data: T | null = null,
	code: BusinessCode = BusinessCode.SUCCESS,
	message: string = 'success'
): ApiResponse<T> => {
	return {
		code,
		data,
		message,
		success: code === BusinessCode.SUCCESS,
	}
}

// 创建错误响应的工具函数
export const createErrorResponse = (
	code: BusinessCode = BusinessCode.FAIL,
	message: string = 'fail'
): ApiResponse => {
	return createApiResponse(null, code, message)
}
