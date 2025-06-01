import { parsedEnv } from '@/lib/parsedEnv';

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Aggressively clear the authToken cookie
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: parsedEnv.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately (already tried)
      maxAge: 0, // Explicitly set maxAge to 0
      path: '/', // Ensure path is correct
      domain:
        parsedEnv.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost', // Be specific with domain in production if applicable
    });

    // As a fallback, try to delete it as well (some browsers might respond better)
    response.cookies.delete('authToken');

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
