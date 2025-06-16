import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserProfile } from '@/lib/auth';
import { UserProfileUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import type { User } from '@/lib/types';

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }
  const token = authHeader.substring(7);
  const decodedUser = await verifyToken<User>(token);

  if (!decodedUser || !decodedUser.id) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
  const userId = decodedUser.id;

  try {
    const body = await req.json();
    // Ensure we don't pass undefined for fields that shouldn't be nullable if not present
    const cleanedBody = Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined));
    const validationResult = UserProfileUpdateSchema.safeParse(cleanedBody);


    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input for profile update', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    const updatedUser = await updateUserProfile(userId, validationResult.data);

    if (!updatedUser) {
        return NextResponse.json({ error: 'Failed to update profile or user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });

  } catch (error) {
    if (error instanceof ZodError) { // Should be caught by safeParse generally
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('Username already taken')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    console.error('Pod Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error in Pod profile update' }, { status: 500 });
  }
}