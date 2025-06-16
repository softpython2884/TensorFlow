
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserRole, findUserById } from '@/lib/auth';
import { UserRoleSchema } from '@/lib/schemas';
import { z, ZodError } from 'zod';
import type { User } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid session token' }, { status: 401 });
  }
  const sessionToken = authHeader.substring(7);
  const decodedAdminUser = await verifyToken<User>(sessionToken);

  if (!decodedAdminUser || !decodedAdminUser.id || (decodedAdminUser.role !== 'ADMIN' && decodedAdminUser.role !== 'Owner')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required at Pod' }, { status: 403 });
  }

  const { userId: targetUserId } = params;
  if (!targetUserId) {
    return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validationResult = z.object({ role: UserRoleSchema }).safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input for role', details: validationResult.error.flatten() }, { status: 400 });
    }
    const { role: newRole } = validationResult.data;
    
    // Prevent owner from demoting themselves if they are the last owner
    if (decodedAdminUser.id === targetUserId && decodedAdminUser.role === 'Owner' && newRole !== 'Owner') {
        const ownerCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'Owner'").get() as { count: number };
        if (ownerCount.count <= 1) {
            return NextResponse.json({ error: 'Cannot demote the last Owner of the system.' }, { status: 403 });
        }
    }
    
    const updatedUser = await updateUserRole(targetUserId, newRole);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found or role unchanged' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    console.error('Pod Admin Update User Role error:', error);
    return NextResponse.json({ error: 'Internal server error in Pod' }, { status: 500 });
  }
}
