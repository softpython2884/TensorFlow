
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import type { UserRole } from './schemas';
import { JWT_SECRET, TOKEN_COOKIE_NAME } from './schemas'; // Using updated schema for JWT_SECRET
import db from './db'; // Import the SQLite db instance
import type { User } from './types'; // Ensure User type is correctly defined

// User type for database interaction (includes password_hash)
interface UserFromDb extends Omit<User, 'role' | 'name'> {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  password_hash: string;
  role: string; // Role from DB might be string, will be cast to UserRole
  lastLogin?: string | null;
  created_at?: string;
}


const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(JWT_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(payload: object, expiresIn: string = '1d'): Promise<string> {
  const token = await new SignJWT(payload as any) 
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET_UINT8ARRAY);
  return token;
}

export async function verifyToken<T extends object>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_UINT8ARRAY);
    return payload as T;
  } catch (error) {
    // console.error("Token verification failed:", error);
    return null;
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string; // Added name to AuthenticatedUser
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
}


// --- SQLite Integrated Functions ---

export async function findUserByEmail(email: string): Promise<UserFromDb | null> {
  try {
    const stmt = db.prepare('SELECT id, email, username, firstName, lastName, password_hash, role, lastLogin FROM users WHERE email = ?');
    const user = stmt.get(email) as UserFromDb | undefined;
    return user || null;
  } catch (error) {
    console.error("SQLite Error (findUserByEmail):", error);
    return null;
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const stmt = db.prepare("UPDATE users SET lastLogin = datetime('now') WHERE id = ?");
    stmt.run(userId);
  } catch (error) {
    console.error("SQLite Error (updateUserLastLogin):", error);
  }
}

// --- End SQLite Integrated Functions ---


export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = await getJwtFromRequest(request);
  if (token) {
    const decoded = await verifyToken<AuthenticatedUser>(token); // Expect AuthenticatedUser structure from token
    return decoded || null;
  }
  return null;
}


export async function getJwtFromRequest(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); 
    }
    
    // Using TOKEN_COOKIE_NAME from TensorFlow schemas
    const cookieToken = request.cookies.get(TOKEN_COOKIE_NAME);
    if (cookieToken?.value) {
        return cookieToken.value;
    }
    
    return null;
}

export const API_TOKEN_PREFIX = "tf_pat_"; // TensorFlow Personal Access Token
const API_TOKEN_LENGTH = 32; 

export function generateApiTokenString(): { rawToken: string, prefix: string } {
  const randomBytes = crypto.randomBytes(API_TOKEN_LENGTH);
  const tokenPart = randomBytes.toString('hex').slice(0, API_TOKEN_LENGTH * 2); 
  const rawToken = `${API_TOKEN_PREFIX}${tokenPart}`;
  // Use a portion of the token part for the prefix, ensuring it's unique enough but not too long
  const prefix = `${API_TOKEN_PREFIX}${tokenPart.slice(0, 12)}`; 
  return { rawToken, prefix };
}

export async function hashApiToken(token: string): Promise<string> {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function compareApiToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
