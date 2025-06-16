
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import type { UserRole, UserRegistrationInput, UserProfileUpdateInput, SuperAdminCreationInput } from './schemas';
import { ENV, TOKEN_COOKIE_NAME } from './schemas';
import db from './db';
import type { User, UserWithPassword } from './types';

const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(ENV.JWT_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(payload: Pick<User, 'id' | 'email' | 'role' | 'name' | 'username' | 'firstName' | 'lastName'>, expiresIn: string = '7d'): Promise<string> {
  if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET is not defined or too short in ENV. It must be at least 32 characters.");
    throw new Error("JWT_SECRET is not configured correctly for token generation.");
  }
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET_UINT8ARRAY);
  return token;
}

export async function verifyToken<T extends object = User>(token: string): Promise<T | null> {
  try {
    if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length < 32) {
      console.error("JWT_SECRET is not defined or too short in ENV for token verification.");
      throw new Error("JWT_SECRET is not configured correctly for token verification.");
    }
    const { payload } = await jwtVerify(token, JWT_SECRET_UINT8ARRAY);
    return payload as T;
  } catch (error) {
    // console.error("Token verification failed:", error);
    return null;
  }
}

// --- SQLite Integrated User Functions ---

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  try {
    // TODO: SQLite Integration - This is where you'd query your SQLite database
    // const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    const stmt = db.prepare('SELECT id, email, username, firstName, lastName, password_hash, role, avatarUrl, tags, lastLogin, created_at FROM users WHERE email = ?');
    const user = stmt.get(email.toLowerCase()) as UserWithPassword | undefined;
    return user || null;
  } catch (error) {
    console.error("SQLite Error (findUserByEmail):", error);
    return null;
  }
}

export async function findUserById(id: string): Promise<UserWithPassword | null> {
  try {
    // TODO: SQLite Integration
    // const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const stmt = db.prepare('SELECT id, email, username, firstName, lastName, password_hash, role, avatarUrl, tags, lastLogin, created_at FROM users WHERE id = ?');
    const user = stmt.get(id) as UserWithPassword | undefined;
    return user || null;
  } catch (error) {
    console.error("SQLite Error (findUserById):", error);
    return null;
  }
}

export async function createUser(data: UserRegistrationInput | SuperAdminCreationInput): Promise<UserWithPassword> {
  const { email, username, password, firstName, lastName } = data;
  const role = 'role' in data && data.role ? data.role : 'FREE';

  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();

  try {
    // TODO: SQLite Integration
    // db.prepare('INSERT INTO users (id, email, username, password_hash, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?, ?)')
    //   .run(userId, email.toLowerCase(), username, hashedPassword, role, firstName, lastName);
    const stmt = db.prepare(
      'INSERT INTO users (id, email, username, firstName, lastName, password_hash, role, created_at, tags, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?)'
    );
    stmt.run(userId, email.toLowerCase(), username || null, firstName || null, lastName || null, hashedPassword, role, JSON.stringify([]), null);

    const newUser = await findUserById(userId);
    if (!newUser) throw new Error("Failed to retrieve newly created user.");
    return newUser;
  } catch (error) {
    console.error("SQLite Error (createUser):", error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email')) {
      throw new Error('Email already exists.');
    }
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.username') && username) {
      throw new Error('Username already taken.');
    }
    throw new Error('Failed to create user.');
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    // TODO: SQLite Integration
    // db.prepare("UPDATE users SET lastLogin = datetime('now') WHERE id = ?").run(userId);
    const stmt = db.prepare("UPDATE users SET lastLogin = datetime('now') WHERE id = ?");
    stmt.run(userId);
  } catch (error) {
    console.error("SQLite Error (updateUserLastLogin):", error);
  }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        // TODO: SQLite Integration
        // const usersFromDb = db.prepare('SELECT id, email, username, firstName, lastName, role, avatarUrl, tags, lastLogin, created_at FROM users ORDER BY created_at DESC').all();
        const stmt = db.prepare('SELECT id, email, username, firstName, lastName, role, avatarUrl, tags, lastLogin, created_at FROM users ORDER BY created_at DESC');
        const usersFromDb = stmt.all() as any[]; // Cast as any[] and then map to User
        return usersFromDb.map(u => ({
            ...u,
            name: (u.firstName || u.lastName) ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.username || u.email,
            tags: u.tags ? JSON.parse(u.tags) : [], // Assuming tags are stored as JSON string
        }));
    } catch (error) {
        console.error("SQLite Error (getAllUsers):", error);
        return [];
    }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User | null> {
    try {
        // TODO: SQLite Integration
        // const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
        const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
        const result = stmt.run(role, userId);
        if (result.changes === 0) {
            return null; // User not found or role already the same
        }
        const updatedUserRaw = await findUserById(userId);
        if (!updatedUserRaw) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...updatedUser } = updatedUserRaw;
         return {
            ...updatedUser,
            name: (updatedUser.firstName || updatedUser.lastName) ? `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() : updatedUser.username || updatedUser.email,
            tags: updatedUser.tags ? JSON.parse(updatedUser.tags as string) : [],
        };
    } catch (error) {
        console.error("SQLite Error (updateUserRole):", error);
        throw new Error("Failed to update user role.");
    }
}

export async function updateUserProfile(userId: string, data: UserProfileUpdateInput): Promise<User | null> {
    const { username, firstName, lastName, avatarUrl, tags } = data;
    const fieldsToUpdate: string[] = [];
    const valuesToUpdate: any[] = [];

    // Build the query dynamically based on provided fields
    if (username !== undefined) {
        fieldsToUpdate.push("username = ?");
        valuesToUpdate.push(username || null); // Ensure null if empty string, etc.
    }
    if (firstName !== undefined) {
        fieldsToUpdate.push("firstName = ?");
        valuesToUpdate.push(firstName || null);
    }
    if (lastName !== undefined) {
        fieldsToUpdate.push("lastName = ?");
        valuesToUpdate.push(lastName || null);
    }
    if (avatarUrl !== undefined) {
        fieldsToUpdate.push("avatarUrl = ?");
        valuesToUpdate.push(avatarUrl || null);
    }
    if (tags !== undefined) {
        fieldsToUpdate.push("tags = ?");
        valuesToUpdate.push(tags ? JSON.stringify(tags) : null); // Store tags as JSON string
    }
    
    if (fieldsToUpdate.length === 0) {
      // No actual changes submitted, return current user data
      const currentUserRaw = await findUserById(userId);
      if (!currentUserRaw) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...currentUser } = currentUserRaw;
      return {
        ...currentUser,
        name: (currentUser.firstName || currentUser.lastName) ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : currentUser.username || currentUser.email,
        tags: currentUser.tags ? JSON.parse(currentUser.tags as string) : [],
      };
    }

    valuesToUpdate.push(userId); // For the WHERE clause
    const query = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

    try {
        // TODO: SQLite Integration - Execute the update query
        // If username is being updated, check for uniqueness first
        if (username) {
            // const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
            const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
            if (existingUser) {
                throw new Error('Username already taken.');
            }
        }
        // db.prepare(query).run(...valuesToUpdate);
        const stmt = db.prepare(query);
        stmt.run(...valuesToUpdate);
        
        const updatedUserRaw = await findUserById(userId);
        if (!updatedUserRaw) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...updatedUser } = updatedUserRaw;
        return {
            ...updatedUser,
            name: (updatedUser.firstName || updatedUser.lastName) ? `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() : updatedUser.username || updatedUser.email,
            tags: updatedUser.tags ? JSON.parse(updatedUser.tags as string) : [],
        };
    } catch (error) {
        console.error("SQLite Error (updateUserProfile):", error);
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.username')) {
            throw new Error('Username already taken.');
        }
        throw new Error("Failed to update user profile.");
    }
}

export async function countOwners(): Promise<number> {
  try {
    // TODO: SQLite Integration
    // const result = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'Owner'").get() as { count: number };
    const result = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'Owner'").get() as { count: number };
    return result.count;
  } catch (error) {
    console.error("SQLite Error (countOwners):", error);
    return 0; // Return 0 on error to prevent setup lockout if DB fails
  }
}

// --- End SQLite Integrated User Functions ---


export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = await getJwtFromRequest(request);
  if (token) {
    const decoded = await verifyToken<User>(token); // Expect User structure from token
    return decoded || null;
  }
  return null;
}


export async function getJwtFromRequest(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const cookieToken = request.cookies.get(TOKEN_COOKIE_NAME);
    if (cookieToken?.value) {
        return cookieToken.value;
    }
    return null;
}

    