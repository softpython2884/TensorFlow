
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
    ENV // Using ENV for admin credentials and DB_PATH
} from '@/lib/schemas';
import { hashPassword } from './auth'; // For hashing admin password
import type { UserRole } from './schemas';

const DB_DIR_NAME = 'db'; // Default directory name
const DB_FILE_NAME = 'tensorflow_app.db'; // Default DB file name

const DB_DIR = path.join(process.cwd(), DB_DIR_NAME);

// Use DB_PATH from ENV if set, otherwise use default
const effectiveDbPath = ENV.DB_PATH || path.join(DB_DIR, DB_FILE_NAME);

if (!fs.existsSync(path.dirname(effectiveDbPath))) {
  fs.mkdirSync(path.dirname(effectiveDbPath), { recursive: true });
  console.log(`Created database directory: ${path.dirname(effectiveDbPath)}`);
}

export const db = new Database(effectiveDbPath, { verbose: console.log });
console.log(`SQLite database initialized at: ${effectiveDbPath}`);

async function initializeSchema() {
  let schemaVersion = 0;
  try {
    const row = db.pragma('user_version', { simple: true });
    if (typeof row === 'number') {
        schemaVersion = row;
    }
    console.log(`Current TensorFlow database schema version: ${schemaVersion}`);
  } catch (e) {
    console.warn("Could not read user_version from TensorFlow DB, assuming 0. Error:", e);
  }

  // Version 1: Users table
  if (schemaVersion < 1) {
    console.log("TensorFlow DB: Applying schema version 1 (Users table)...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        firstName TEXT,
        lastName TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'FREE' CHECK(role IN ('FREE', 'PREMIUM', 'PREMIUM_PLUS', 'ENDIUM', 'ADMIN', 'Owner')),
        avatarUrl TEXT,
        tags TEXT, -- Stored as JSON string array "[\"tag1\", \"tag2\"]"
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        lastLogin TEXT
      );
    `);
    
    // Create default admin/owner user if ADMIN_EMAIL is set in ENV and user doesn't exist
    const adminEmail = ENV.ADMIN_EMAIL;
    if (adminEmail) {
      const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
      if (!existingAdmin) {
        try {
          const adminPassword = ENV.ADMIN_PASSWORD || "@Banane123"; // Fallback default password
          const hashedPassword = await hashPassword(adminPassword);
          const adminId = ENV.ADMIN_ID || crypto.randomUUID();
          const adminUsername = ENV.ADMIN_USERNAME || adminEmail.split('@')[0];
          const adminFirstName = ENV.ADMIN_FIRSTNAME || 'Admin';
          const adminLastName = ENV.ADMIN_LASTNAME || 'User';
          const adminRole = (ENV.ADMIN_ROLE as UserRole) || 'Owner';

          db.prepare(
            `INSERT INTO users (id, email, username, firstName, lastName, password_hash, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).run(
            adminId, 
            adminEmail, 
            adminUsername, 
            adminFirstName, 
            adminLastName, 
            hashedPassword, 
            adminRole
          );
          console.log(`TensorFlow DB: Admin user ${adminEmail} created with role ${adminRole}.`);
        } catch (hashError) {
            console.error(`TensorFlow DB: Failed to hash password for admin user ${adminEmail}:`, hashError);
        }
      } else {
        console.log(`TensorFlow DB: Admin user ${adminEmail} already exists.`);
      }
    } else {
        console.warn("TensorFlow DB: ADMIN_EMAIL environment variable not set. Default admin user not automatically created. Use the setup page if needed.");
    }

    db.pragma('user_version = 1');
    console.log("TensorFlow Database schema initialized to version 1 (Users).");
    schemaVersion = 1;
  }

  // Version 2: Placeholder for future tables (e.g., Projects, Tasks)
  // if (schemaVersion < 2) {
  //   console.log("TensorFlow DB: Applying schema version 2 (Example: Projects table)...");
  //   db.exec(`
  //     CREATE TABLE IF NOT EXISTS projects (
  //       id TEXT PRIMARY KEY,
  //       name TEXT NOT NULL,
  //       owner_id TEXT NOT NULL,
  //       created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  //       FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  //     );
  //   `);
  //   db.pragma('user_version = 2');
  //   console.log("TensorFlow Database schema upgraded to version 2.");
  //   schemaVersion = 2;
  // }

}

// Initialize schema
(async () => {
    try {
        await initializeSchema();
    } catch (e) {
        console.error("CRITICAL ERROR during TensorFlow database schema initialization:", e);
    }
})();

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db;
