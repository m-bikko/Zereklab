import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { validateAdminCredentials } from '@/lib/userStore'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const isValid = validateAdminCredentials(username, password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Generate JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }) // Token expires in 1 hour

    // Set token in a cookie (HttpOnly for security)
    const response = NextResponse.json({ message: 'Login successful', token })
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 