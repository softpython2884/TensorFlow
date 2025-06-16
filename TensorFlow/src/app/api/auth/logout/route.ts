
import { NextResponse } from 'next/server';
import { TOKEN_COOKIE_NAME } from '@/lib/schemas';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Expire the cookie
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('BFF Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
