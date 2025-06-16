
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth'; // Uses JWT from cookie via Pod
import { ENV } from '@/lib/schemas';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

export async function GET(req: NextRequest) {
  try {
    const userFromCookieJwt = await getUserFromRequest(req);

    if (!userFromCookieJwt) {
      return NextResponse.json({ error: 'Not authenticated or invalid session token' }, { status: 401 });
    }
    
    // Pass the original cookie token to the Pod /me endpoint for re-validation and fresh data
    const token = req.cookies.get(ENV.TOKEN_COOKIE_NAME)?.value;
    if (!token) {
         return NextResponse.json({ error: 'Session token missing' }, { status: 401 });
    }

    const podResponse = await fetch(`${POD_API_URL}/api/pod/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Pass the session token
        'Content-Type': 'application/json',
      },
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
        // If pod says unauthorized, clear cookie and return 401
        if (podResponse.status === 401) {
            const clearCookieResponse = NextResponse.json({ error: podData.error || 'Pod unauthorized' }, { status: 401 });
            clearCookieResponse.cookies.delete(ENV.TOKEN_COOKIE_NAME);
            return clearCookieResponse;
        }
        return NextResponse.json({ error: podData.error || 'Failed to fetch user profile from Pod' }, { status: podResponse.status });
    }
    
    return NextResponse.json({ user: podData.user }, { status: 200 });

  } catch (error) {
    console.error('BFF /me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
