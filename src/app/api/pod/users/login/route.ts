// src/app/api/pod/users/login/route.ts (Pod API Endpoint)
// This is the core backend logic for user login.
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, createSessionToken, updateUserLastLogin } from '@/lib/auth';
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

    // --- TODO: SQLite Integration Point ---
    // The findUserByEmail function currently uses a JSON placeholder and .env.
    // You'll replace its internals with your SQLite query to fetch a user by email.
    // Example: const userFromDb = await db.prepare("SELECT id, email, password_hash, role, name FROM users WHERE email = ?").get(email);
    const userFromDb = await findUserByEmail(email);
    // --- End SQLite Integration Point ---

    if (!userFromDb) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // --- TODO: SQLite Integration Point for Password Verification ---
    // The verifyPassword function uses bcryptjs. Ensure your stored passwords are hashed with bcryptjs.
    // userFromDb.password should be the hashed password from your SQLite database.
    const isValidPassword = await verifyPassword(password, userFromDb.password);
    // --- End SQLite Integration Point ---

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userToSign } = userFromDb;
    
    const token = await createSessionToken(userToSign as User); // Cast as User after removing password

    // --- TODO: SQLite Integration Point for updating lastLogin ---
    // The updateUserLastLogin function is a placeholder.
    // Replace its internals with your SQLite query to update the user's last_login timestamp.
    await updateUserLastLogin(userFromDb.id);
    // --- End SQLite Integration Point ---
    
    // The Pod API returns the token and user data (excluding password)
    return NextResponse.json({ token, user: userToSign }, { status: 200 });

  } catch (error) {
    console.error('Login error in Pod API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
