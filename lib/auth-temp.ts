// Temporary auth utilities that work without full Prisma client
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface AuthUser {
  id: number
  email: string
  name: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Verify JWT token
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch {
    return null
  }
}

// Get user from request (simplified for now)
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  // For now, return a mock user - this will be replaced when Prisma works
  if (decoded.userId === 1) {
    return {
      id: 1,
      email: 'demo@example.com',
      name: 'Demo User'
    }
  }

  return null
}
