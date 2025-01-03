import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET);
const JWT_ISSUER = process.env.JWT_ISSUER || 'nextjs-sample-issuer';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'nextjs-sample-audience';

export interface JWTPayload {
  id: number;
  email: string;
  username: string;
  role: string;
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
      .sign(JWT_SECRET);

    return token;
  }

  // 生成刷新令牌 (长期)
  static async signRefreshToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime('7d') // 7天过期
      .sign(REFRESH_SECRET);

    return token;
  }

  // 验证访问令牌
  static async verifyAccessToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      return payload as unknown as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // 验证刷新令牌
  static async verifyRefreshToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, REFRESH_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      return payload as unknown as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
