
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { UserRoleSchema, ENV } from '@/lib/schemas';
import { z, ZodError } from 'zod';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const requestingAdmin = await getUserFromRequest(req);
  if (!requestingAdmin || (requestingAdmin.role !== 'ADMIN' && requestingAdmin.role !== 'Owner')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { userId: targetUserId } = params;
  if (!targetUserId) {
    return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validationResult = z.object({ role: UserRoleSchema }).safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    const { role } = validationResult.data;

    const sessionToken = req.cookies.get(ENV.TOKEN_COOKIE_NAME)?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token missing for Pod request' }, { status: 401 });
    }

    const podResponse = await fetch(`${POD_API_URL}/api/pod/admin/users/${targetUserId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`, 
      },
      body: JSON.stringify({ role }),
    });

    const podData = await podResponse.json();
    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Failed to update user role at Pod' }, { status: podResponse.status });
    }
    return NextResponse.json(podData);

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    console.error('BFF Admin Update User Role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
