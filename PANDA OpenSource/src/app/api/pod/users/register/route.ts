
import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db'; // Using TensorFlow DB
import { hashPassword, generateToken, type AuthenticatedUser } from '@/lib/auth'; // Using TensorFlow Auth
import { UserRegistrationSchema, UserRoleSchema } from '@/lib/schemas'; // Using TensorFlow Schemas
import { ZodError } from 'zod';
import crypto from 'crypto';
import type { UserRole } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = UserRegistrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }

    const { username, email, password, firstName, lastName } = validationResult.data;

    // Check for existing email
    const existingEmailStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingEmail = existingEmailStmt.get(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Check for existing username (if provided and not empty)
    if (username) {
        const existingUsernameStmt = db.prepare('SELECT id FROM users WHERE username = ?');
        const existingUsername = existingUsernameStmt.get(username);
        if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    // All new registrations are 'FREE' tier by default. Admin can change role later.
    const defaultRole: UserRole = 'FREE'; 

    const insertStmt = db.prepare(
      'INSERT INTO users (id, username, email, password_hash, role, firstName, lastName, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
    );
    insertStmt.run(userId, username || null, email, hashedPassword, defaultRole, firstName || null, lastName || null);

    const userForToken: AuthenticatedUser = {
      id: userId,
      email: email,
      username: username || undefined,
      firstName: firstName || null,
      lastName: lastName || null,
      name: (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : username || email,
      role: defaultRole,
    };

    const token = await generateToken(userForToken);

    return NextResponse.json({ 
        message: 'User registered successfully.', 
        user: userForToken, // Send back the created user profile
        token 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input during processing', details: error.flatten() }, { status: 400 });
    }
    console.error('Pod Registration error:', error);
    // Check for SQLite specific unique constraint errors
    if (error instanceof Error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
        if (username && error.message.includes('UNIQUE constraint failed: users.username')) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
    }
    return NextResponse.json({ error: 'Internal server error in Pod' }, { status: 500 });
  }
}
