
import { NextRequest, NextResponse } from 'next/server';
import { UserRegistrationSchema, ENV, TOKEN_COOKIE_NAME, MAX_AGE_COOKIE_SECONDS } from '@/lib/schemas';
import { ZodError } from 'zod';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = UserRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const podResponse = await fetch(`${POD_API_URL}/api/pod/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Registration failed at Pod' }, { status: podResponse.status });
    }

    const { token, user } = podData; 

    if (!token || !user) {
        return NextResponse.json({ error: 'Registration successful, but failed to establish session.' }, { status: 500 });
    }

    const response = NextResponse.json({ message: 'Registration successful and logged in.', user }, { status: 201 }); 
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
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    console.error('BFF Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error in BFF registration' }, { status: 500 });
  }
}
