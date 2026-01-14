import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../data/trading.db");
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Create database instance
export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize database schema
export function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      accountId TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      isApproved INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_isApproved ON users(isApproved);
  `);

  console.log("✅ Database initialized successfully");
}

// User model functions
const userModel = {
  findByUsername: (username) => {
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  },

  findByEmail: (email) => {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  },

  findById: (id) => {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  },

  findByUsernameOrEmail: (identifier) => {
    return db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(identifier, identifier);
  },

  create: (userData) => {
    const { username, email, password, name, accountId } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if this is the first user - make them admin
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const isFirstUser = userCount.count === 0;

    const result = db
      .prepare(
        `
        INSERT INTO users (username, email, password, name, accountId, isAdmin, isApproved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        username,
        email,
        hashedPassword,
        name || username,
        accountId,
        isFirstUser ? 1 : 0, // First user becomes admin
        isFirstUser ? 1 : 0 // First user is auto-approved
      );

    return userModel.findById(result.lastInsertRowid);
  },

  update: (id, updates) => {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (key !== "id" && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    return userModel.findById(id);
  },

  approve: (id) => {
    return userModel.update(id, { isApproved: 1 });
  },

  reject: (id) => {
    return db.prepare("DELETE FROM users WHERE id = ? AND isAdmin = 0").run(id);
  },

  getAllPending: () => {
    return db
      .prepare(
        "SELECT * FROM users WHERE isApproved = 0 ORDER BY createdAt DESC"
      )
      .all();
  },

  getAll: () => {
    return db
      .prepare(
        "SELECT id, username, email, name, accountId, isAdmin, isApproved, createdAt FROM users ORDER BY createdAt DESC"
      )
      .all();
  },

  updatePassword: (id, newPassword) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return userModel.update(id, { password: hashedPassword });
  },
};

export { userModel };
