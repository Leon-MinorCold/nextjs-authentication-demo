import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET)
const JWT_ISSUER = process.env.JWT_ISSUER || 'nextjs-sample-issuer'
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'nextjs-sample-audience'

export interface JWTPayload {
	id: number
	email: string
	username: string
	role: string
}

export class JWT {
	// 生成访问令牌 (短期)
	static async signAccessToken(payload: JWTPayload): Promise<string> {
		const token = await new SignJWT({ ...payload })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setIssuer(JWT_ISSUER)
			.setAudience(JWT_AUDIENCE)
			.setExpirationTime('15m') // 15分钟过期
			.sign(JWT_SECRET)

		return token
	}

	// 生成刷新令牌 (长期)
	static async signRefreshToken(payload: JWTPayload): Promise<string> {
		const token = await new SignJWT({ ...payload })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setIssuer(JWT_ISSUER)
			.setAudience(JWT_AUDIENCE)
			.setExpirationTime('7d') // 7天过期
			.sign(REFRESH_SECRET)

		return token
	}

	// 验证访问令牌
	static async verifyAccessToken(token?: string) {
		if (!token) return null
		try {
			const { payload } = await jwtVerify(token, JWT_SECRET, {
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			})
			return payload as unknown as JWTPayload
		} catch (error) {
			return null
		}
	}

	// 验证刷新令牌
	static async verifyRefreshToken(token?: string) {
		if (!token) return null
		try {
			const { payload } = await jwtVerify(token, REFRESH_SECRET, {
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			})
			return payload as unknown as JWTPayload
		} catch (error) {
			return null
		}
	}

	static injectAccessCookie(response: NextResponse, accessToken: string) {
		if (!accessToken) throw new Error('access_token missed')
		response.cookies.set('access_token', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 15 * 60, // 15分钟
			path: '/',
		})
	}

	static injectRefreshCookie(response: NextResponse, refreshToken: string) {
		if (!refreshToken) throw new Error('refresh_token missed')
		response.cookies.set('refresh_token', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60, // 7天
			path: '/',
		})
	}

	// Todo: 待实现登出功能
	static async removeAccessToken(response: NextResponse) {}
}
