import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, comparePassword, generateToken, updateUserLastLogin } from '@/lib/auth';
import { LoginSchema } from '@/lib/schemas';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const userFromDb = await findUserByEmail(email);

    if (!userFromDb || !userFromDb.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password (user not found or no hash)' }, { status: 401 });
    }
    
    const isValidPassword = await comparePassword(password, userFromDb.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password (password mismatch)' }, { status: 401 });
    }

    // Prepare user object for the token and response
    const userForToken: Pick<User, 'id' | 'email' | 'role' | 'name' | 'username' | 'firstName' | 'lastName'> = {
      id: userFromDb.id,
      email: userFromDb.email,
      role: userFromDb.role,
      name: (userFromDb.firstName || userFromDb.lastName) 
            ? `${userFromDb.firstName || ''} ${userFromDb.lastName || ''}`.trim() 
            : userFromDb.username || userFromDb.email,
      username: userFromDb.username || undefined,
      firstName: userFromDb.firstName || null,
      lastName: userFromDb.lastName || null,
    };
    
    const token = await generateToken(userForToken);

    await updateUserLastLogin(userFromDb.id);
    
    // Return the token and the user data (excluding password_hash)
    return NextResponse.json({ token, user: userForToken }, { status: 200 });

  } catch (error) {
    console.error('Pod Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error in Pod login' }, { status: 500 });
  }
}