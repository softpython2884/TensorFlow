
import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema, ENV, TOKEN_COOKIE_NAME, MAX_AGE_COOKIE_SECONDS } from '@/lib/schemas';
// SignJWT removed as token generation is Pod's responsibility

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;
    
    const podResponse = await fetch(`${POD_API_URL}/api/pod/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Login failed at Pod API' }, { status: podResponse.status });
    }

    const { token, user } = podData;

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE_COOKIE_SECONDS,
      path: '/',
      sameSite: 'lax',
    });
    
    return response;

  } catch (error) {
    console.error('BFF Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error in BFF' }, { status: 500 });
  }
}
