import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

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

// Get user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  const cookieToken = request.cookies.get('auth-token')?.value
  const token = authHeader?.replace('Bearer ', '') || cookieToken

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  
  if (!decoded) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true }
  })

  return user
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const sessionToken = jwt.sign({ userId, type: 'session' }, JWT_SECRET, { expiresIn: '30d' })
  
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  })

  return sessionToken
}

// Validate session
export async function validateSession(sessionToken: string): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: { select: { id: true, email: true, name: true } } }
  })

  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return session.user
}

// Delete session
export async function deleteSession(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken }
  })
}
