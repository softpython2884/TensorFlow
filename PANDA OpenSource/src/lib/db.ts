
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
    PANDA_ADMIN_EMAIL, 
    PANDA_ADMIN_PASSWORD,
    ADMIN_ID,
    ADMIN_FIRSTNAME,
    ADMIN_LASTNAME,
    ADMIN_USERNAME
} from '@/lib/schemas'; // Using PANDA_ADMIN_EMAIL as per existing file structure
import { hashPassword } from './auth'; // For hashing admin password

const DB_DIR_NAME = 'db'; // TensorFlow app DB directory
const DB_FILE_NAME = 'tensorflow_app.db'; // TensorFlow app DB file

const DB_DIR = path.join(process.cwd(), DB_DIR_NAME);
const DB_PATH = path.join(DB_DIR, DB_FILE_NAME);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log(`Created database directory: ${DB_DIR}`);
}

export const db = new Database(DB_PATH, { verbose: console.log });
console.log(`SQLite database initialized at: ${DB_PATH}`);

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

  // Version 1: Initial Users table for TensorFlow
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
        role TEXT NOT NULL DEFAULT 'FREE',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        lastLogin TEXT
      );
    `);
    
    // Create default admin user if PANDA_ADMIN_EMAIL is set
    if (PANDA_ADMIN_EMAIL) {
      const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(PANDA_ADMIN_EMAIL);
      if (!existingAdmin) {
        try {
          const hashedPassword = await hashPassword(PANDA_ADMIN_PASSWORD || "@Banane123"); // Use default if not set
          db.prepare(
            `INSERT INTO users (id, email, username, firstName, lastName, password_hash, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).run(
            ADMIN_ID || crypto.randomUUID(), 
            PANDA_ADMIN_EMAIL, 
            ADMIN_USERNAME || PANDA_ADMIN_EMAIL.split('@')[0], 
            ADMIN_FIRSTNAME || 'Admin', 
            ADMIN_LASTNAME || 'User', 
            hashedPassword, 
            'Owner' // Default role for this admin
          );
          console.log(`TensorFlow DB: Admin user ${PANDA_ADMIN_EMAIL} created with role Owner.`);
        } catch (hashError) {
            console.error(`TensorFlow DB: Failed to hash password for admin user ${PANDA_ADMIN_EMAIL}:`, hashError);
        }
      } else {
        console.log(`TensorFlow DB: Admin user ${PANDA_ADMIN_EMAIL} already exists.`);
      }
    } else {
        console.warn("TensorFlow DB: PANDA_ADMIN_EMAIL (or ADMIN_EMAIL) environment variable not set. Default admin user not created.");
    }

    db.pragma('user_version = 1');
    console.log("TensorFlow Database schema initialized to version 1.");
    schemaVersion = 1;
  }

  // Version 2: Projects Table
  if (schemaVersion < 2) {
    console.log("TensorFlow DB: Applying schema version 2 (Projects table)...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('Active', 'Paused', 'Completed', 'Archived')) NOT NULL DEFAULT 'Active',
        progression INTEGER DEFAULT 0,
        owner_id TEXT NOT NULL, -- User who created/owns the project
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        due_date TEXT,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role_in_project TEXT NOT NULL DEFAULT 'Viewer', -- e.g., Editor, Viewer
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    db.pragma('user_version = 2');
    console.log("TensorFlow Database schema upgraded to version 2 (Projects).");
    schemaVersion = 2;
  }

  // Version 3: Tasks Table
  if (schemaVersion < 3) {
    console.log("TensorFlow DB: Applying schema version 3 (Tasks table)...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('To Do', 'In Progress', 'In Review', 'Done')) NOT NULL DEFAULT 'To Do',
        assignee_id TEXT,
        reporter_id TEXT,
        due_date TEXT,
        priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
        tags TEXT, -- Store as JSON string array "[\"tag1\", \"tag2\"]"
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    db.pragma('user_version = 3');
    console.log("TensorFlow Database schema upgraded to version 3 (Tasks).");
    schemaVersion = 3;
  }
  
   // Placeholder for future migrations (e.g., files, notes, etc.)
   // if (schemaVersion < 4) { ... }

}

// Initialize schema and potentially create admin user on first import
(async () => {
    try {
        await initializeSchema();
    } catch (e) {
        console.error("CRITICAL ERROR during TensorFlow database schema initialization:", e);
        console.error("The application might be in an unstable state. Please check the database manually or consider deleting the db file to reinitialize.");
        // Optionally, exit if the DB setup is critical for startup and fails
        // process.exit(1); 
    }
})();


process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db;
