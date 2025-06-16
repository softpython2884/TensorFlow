
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserRole, findUserById, countOwners } from '@/lib/auth';
import { UserRoleSchema } from '@/lib/schemas';
import { z, ZodError } from 'zod';
import type { User } from '@/lib/types';
import db from '@/lib/db'; // Direct db import for countOwners if it's not in auth.ts

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
    
    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    // Prevent owner from demoting themselves if they are the last owner
    if (targetUser.role === 'Owner' && newRole !== 'Owner') {
        const totalOwners = await countOwners();
        if (totalOwners <= 1) {
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
    return NextResponse.json({ error: