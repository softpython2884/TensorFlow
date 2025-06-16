// src/app/api/auth/logout/route.ts (BFF API Endpoint)
import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    clearTokenCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error in BFF API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
