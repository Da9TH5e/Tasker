// backend/src/lib/jwt.ts

import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET!
  return jwt.sign(payload, secret, { expiresIn: '15m' })
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET!
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET!
  return jwt.verify(token, secret) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET!
  return jwt.verify(token, secret) as TokenPayload
}