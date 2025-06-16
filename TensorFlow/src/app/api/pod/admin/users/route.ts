
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAllUsers } from '@/lib/auth';
import type { User } from '@/lib/types';

// GET all users (Pod layer, expects admin JWT)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid session token' }, { status: 401 });
  }
  const sessionToken = authHeader.substring(7);
  const decodedAdminUser = await verifyToken<User>(sessionToken);

  if (!decodedAdminUser || !decodedAdminUser.id || (decodedAdminUser.role !== 'ADMIN' && decodedAdminUser.role !== 'Owner')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required at Pod layer' }, { status: 403 });
  }

  try {
    const users = await getAllUsers(); // This function now returns User[] without password_hash
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Pod Admin List Users error:', error);
    return NextResponse.json({ error: 'Internal server error while fetching users' }, { status: 500 });
  }
}
