// src/lib/auth.ts (Server-side authentication utilities)
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { User, UserWithPassword } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_COOKIE_NAME, MAX_AGE_COOKIE, ENV } from '@/lib/schemas'; // Using ENV for JWT_SECRET_KEY
import bcrypt from 'bcryptjs';
import fs from 'fs/promises'; // For reading users.json placeholder
import path from 'path';     // For reading users.json placeholder

const USERS_DB_PLACEHOLDER_PATH = path.join(process.cwd(), 'db', 'users.json');

// Ensure JWT_SECRET_KEY is a Uint8Array
const getJwtSecretKey = () => {
  const secret = ENV.JWT_SECRET_KEY;
  if (!secret || secret.length < 32) {
    // This check is more for runtime if the env schema default was too short or not set
    // ENV.JWT_SECRET_KEY already validates length server-side on startup
    console.error("JWT_SECRET_KEY is not defined or too short. It must be at least 32 characters.");
    throw new Error("JWT_SECRET_KEY is not configured correctly.");
  }
  return new TextEncoder().encode(secret);
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword?: string): Promise<boolean> {
  if (!hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
}


// TODO: SQLite Integration for User Fetching
// This function currently reads from users.json as a placeholder.
// Replace its content with your actual SQLite database query.
export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  // Admin user from environment variables (highest priority)
  if (ENV.ADMIN_EMAIL && email === ENV.ADMIN_EMAIL) {
    return {
      id: ENV.ADMIN_ID || "env-admin-001",
      firstName: ENV.ADMIN_FIRSTNAME || "Admin",
      lastName: ENV.ADMIN_LASTNAME || "EnvUser",
      username: ENV.ADMIN_USERNAME || "admin_env",
      email: ENV.ADMIN_EMAIL,
      role: (ENV.ADMIN_ROLE as User["role"]) || "Owner",
      password: ENV.ADMIN_PASSWORD ? await hashPassword(ENV.ADMIN_PASSWORD) : undefined, // Hash if provided, store hashed
      avatarUrl: "https://placehold.co/100x100.png",
      tags: ["admin", "owner", "env_configured"],
      name: `${ENV.ADMIN_FIRSTNAME || "Admin"} ${ENV.ADMIN_LASTNAME || "EnvUser"}`,
      lastLogin: new Date().toISOString(), // Placeholder, update mechanism needed
    };
  }

  // Fallback to users.json (placeholder for DB)
  try {
    const data = await fs.readFile(USERS_DB_PLACEHOLDER_PATH, 'utf-8');
    const usersFromFile: UserWithPassword[] = JSON.parse(data);
    const user = usersFromFile.find(u => u.email === email);
    if (user) {
      // In a real scenario, password would already be hashed in DB.
      // For the JSON placeholder, if it's not hashed, hash it now (conceptual)
      // This part is more illustrative as the json password should be considered hashed.
      if (user.password && !user.password.startsWith('$2a$')) { 
         // console.warn(`Password for ${user.email} in users.json is not hashed. This is insecure.`);
         // user.password = await hashPassword(user.password); // For demo, we'd need to persist this
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error reading users.json placeholder:", error);
    return null;
  }
}

// TODO: SQLite Integration for User Update (e.g., lastLogin)
// This function is a placeholder for updating user data in your SQLite database.
export async function updateUserLastLogin(userId: string): Promise<void> {
  console.log(`Placeholder: Updating last login for user ${userId} in SQLite.`);
  // Example for users.json (conceptual, not ideal for concurrent writes)
  try {
    const data = await fs.readFile(USERS_DB_PLACEHOLDER_PATH, 'utf-8');
    let usersFromFile: UserWithPassword[] = JSON.parse(data);
    const userIndex = usersFromFile.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      usersFromFile[userIndex].lastLogin = new Date().toISOString();
      await fs.writeFile(USERS_DB_PLACEHOLDER_PATH, JSON.stringify(usersFromFile, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error("Error updating lastLogin in users.json placeholder:", error);
  }
}


export async function createSessionToken(user: Pick<User, 'id' | 'email' | 'role' | 'name'>) {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // As per MAX_AGE_COOKIE
    .sign(getJwtSecretKey());
  return token;
}

export async function verifySessionToken(token: string): Promise<(JWTPayload & User) | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    // Construct a User-like object from payload for type consistency
    return {
      id: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string, // Assuming name is in payload
      ...payload // include any other payload fields
    } as (JWTPayload & User);
  } catch (error) {
    console.log('Failed to verify session token:', (error as Error).message);
    return null;
  }
}

export async function getJwtFromRequest(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get(TOKEN_COOKIE_NAME);
  return cookie?.value || null;
}

export async function getUserFromRequest(req: NextRequest): Promise<(JWTPayload & User) | null> {
  const token = await getJwtFromRequest(req);
  if (!token) return null;
  return verifySessionToken(token);
}

export function setTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_COOKIE,
    path: '/',
    sameSite: 'lax',
  });
}

export function clearTokenCookie(res: NextResponse): void {
  res.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
}
