'use server';

import fs from 'fs/promises';
import path from 'path';
import type { User, UserWithPassword } from '@/lib/types';

const USERS_DB_PATH = path.join(process.cwd(), 'db', 'users.json');

async function getUsers(): Promise<UserWithPassword[]> {
  try {
    const data = await fs.readFile(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data) as UserWithPassword[];
  } catch (error) {
    // If the file doesn't exist or is invalid, return an empty array or handle appropriately
    console.error("Error reading users.json:", error);
    return [];
  }
}

async function saveUsers(users: UserWithPassword[]): Promise<void> {
  try {
    await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users.json:", error);
    throw new Error("Could not save user data.");
  }
}

export async function authenticateUser(
  email: string,
  password?: string // Password argument is kept for structure, but not used if users.json doesn't have passwords
): Promise<{ user: User; error?: null } | { user?: null; error: string }> {
  const users = await getUsers();
  const foundUser = users.find((u) => u.email === email);

  if (!foundUser) {
    return { error: 'User not found.' };
  }

  // IMPORTANT: In a real application, passwords MUST be hashed and compared securely.
  // This is a simplified check for prototyping purposes.
  if (foundUser.password && password !== foundUser.password) {
     return { error: 'Invalid password.' };
  }
  // If no password in DB, or if password matches (or if password wasn't provided for users without one)
  if (!foundUser.password || password === foundUser.password) {
    const { password: _removedPassword, ...userToReturn } = foundUser;
    
    // Update lastLogin
    const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      await saveUsers(users);
    }

    return { user: userToReturn as User };
  }
  
  return { error: 'Invalid credentials.' };
}
