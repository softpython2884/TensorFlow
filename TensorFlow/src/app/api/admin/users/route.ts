import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ENV } from '@/lib/schemas';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

// GET all users (Admin only)
export async function GET(req: NextRequest) {
  const adminUser = await getUserFromRequest(req); // Verifies JWT from cookie
  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'Owner')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const sessionToken = req.cookies.get(ENV.TOKEN_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Session token missing for Pod request' }, { status: 401 });
  }

  try {
    const podResponse = await fetch(`${POD_API_URL}/api/pod/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`, // Pass admin's session token to Pod
      },
    });

    const podData = await podResponse.json();
    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Failed to fetch users from Pod' }, { status: podResponse.status });
    }
    return NextResponse.json(podData); // podData should be { users: User[] }

  } catch (error) {
    console.error('BFF Admin Get Users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}