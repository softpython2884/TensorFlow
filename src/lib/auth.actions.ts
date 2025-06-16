'use server';

import fs from 'fs/promises';
import path from 'path';
import type { User, UserWithPassword } from '@/lib/types';

const USERS_DB_PATH = path.join(process.cwd(), 'db', 'users.json');

// SIMULATES Reading from SQLite users table
async function getUsersFromDbPlaceholder(): Promise<UserWithPassword[]> {
  try {
    // In a real scenario, this would be:
    // const db = require('your-sqlite-library').open(DB_PATH);
    // const users = await db.all('SELECT * FROM users');
    // await db.close();
    // return users;
    const data = await fs.readFile(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data) as UserWithPassword[];
  } catch (error) {
    console.error("Error reading from placeholder users.json (simulating DB read):", error);
    // If the users.json file (placeholder for DB) doesn't exist or is invalid,
    // it means the initial admin user setup is missing.
    // For robust setup, you might want to initialize the DB or ensure the admin user exists.
    // For now, we'll return an empty array, which will cause login to fail if file is missing.
    return [];
  }
}

// SIMULATES Writing to SQLite users table (e.g., for lastLogin update)
async function saveUsersToDbPlaceholder(users: UserWithPassword[]): Promise<void> {
  try {
    // In a real scenario, this would be:
    // const db = require('your-sqlite-library').open(DB_PATH);
    // For updating lastLogin:
    // await db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [newLastLogin, userId]);
    // For saving all users (less common for individual updates):
    // users.forEach(user => db.run('UPDATE users SET ... WHERE id = ?', [...values, user.id]));
    // await db.close();
    await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to placeholder users.json (simulating DB write):", error);
    throw new Error("Could not save user data (placeholder).");
  }
}

export async function authenticateUser(
  email: string,
  passwordInput?: string 
): Promise<{ user: User; error?: null } | { user?: null; error: string }> {
  // TODO: Replace this with your actual SQLite database query
  const users = await getUsersFromDbPlaceholder(); 
  const foundUser = users.find((u) => u.email === email);

  if (!foundUser) {
    return { error: 'User not found.' };
  }

  // IMPORTANT: In a real application, passwords MUST be hashed.
  // This is a simplified check for prototyping with the placeholder.
  // When using SQLite, store hashed passwords and compare using a library like bcrypt.
  // Example with bcrypt:
  // const bcrypt = require('bcryptjs');
  // const passwordIsValid = await bcrypt.compare(passwordInput, foundUser.passwordHash);
  // if (!passwordIsValid) {
  //   return { error: 'Invalid password.' };
  // }

  if (foundUser.password && passwordInput !== foundUser.password) {
     return { error: 'Invalid password.' };
  }
  
  // If password matches (or if no password in DB for some reason, though admin should have one)
  if (!foundUser.password || passwordInput === foundUser.password) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userToReturn } = foundUser; 
    
    // Update lastLogin
    const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      // TODO: Replace this with your actual SQLite database update for lastLogin
      await saveUsersToDbPlaceholder(users); 
    }

    return { user: userToReturn as User };
  }
  
  return { error: 'Invalid credentials.' };
}
