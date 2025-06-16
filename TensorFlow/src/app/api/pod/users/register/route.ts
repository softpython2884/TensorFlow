import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/lib/auth';
import { UserRegistrationSchema, type UserRole } from '@/lib/schemas';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = UserRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // General registration creates 'FREE' users.
    // Admin creation is handled by a separate endpoint or initial DB setup.
    const newUserData = { ...validation.data, role: 'FREE' as UserRole };
    const newUser = await createUser(newUserData);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userToSign } = newUser;

     const userForToken: Pick<User, 'id' | 'email' | 'role' | 'name' | 'username' | 'firstName' | 'lastName'> = {
      id: userToSign.id,
      email: userToSign.email,
      role: userToSign.role,
      name: (userToSign.firstName || userToSign.lastName) 
            ? `${userToSign.firstName || ''} ${userToSign.lastName || ''}`.trim() 
            : userToSign.username || userToSign.email,
      username: userToSign.username || undefined,
      firstName: userToSign.firstName || null,
      lastName: userToSign.lastName || null,
    };

    const token = await generateToken(userForToken);

    return NextResponse.json({ 
        message: 'User registered successfully.', 
        user: userForToken, 
        token 
    }, { status: 201 });

  } catch (error) {
    console.error('Pod Registration error:', error);
    if (error instanceof Error && (error.message.includes('Email already exists') || error.message.includes('Username already taken'))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error in Pod registration' }, { status: 500 });
  }
}