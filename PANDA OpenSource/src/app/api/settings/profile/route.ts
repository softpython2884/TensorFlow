
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { UserProfileUpdateSchema, ENV, TOKEN_COOKIE_NAME } from '@/lib/schemas'; // Updated imports
import { ZodError } from 'zod';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

export async function GET(req: NextRequest) {
    const meResponse = await fetch(new URL('/api/auth/me', req.url), {
        headers: {
            'Cookie': req.headers.get('Cookie') || '', 
        }
    });
    const data = await meResponse.json();
    return NextResponse.json(data, { status: meResponse.status });
}

export async function PUT(req: NextRequest) {
  const userFromSession = await getUserFromRequest(req);
  if (!userFromSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cleanedBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const validationResult = UserProfileUpdateSchema.safeParse(cleanedBody);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    const sessionToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value; // Use TOKEN_COOKIE_NAME from ENV
    if (!sessionToken) {
        return NextResponse.json({ error: 'Session token missing for Pod request' }, { status: 401 });
    }

    const podResponse = await fetch(`${POD_API_URL}/api/pod/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Failed to update profile at Pod' }, { status: podResponse.status });
    }
    return NextResponse.json(podData);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    console.error('BFF Update Profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
