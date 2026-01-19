import dotenv from "dotenv";
dotenv.config();
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
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
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      accountId TEXT,
      server TEXT,
      accountNumber TEXT,
      investorPassword TEXT,
      isAdmin INTEGER DEFAULT 0,
      isApproved INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_isApproved ON users(isApproved);
  `);

  console.log("✅ Database initialized successfully");
}

// ------------------------
// User Model
// ------------------------
export const userModel = {
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
    const {
      username,
      email,
      password,
      name,
      accountId,
      server,
      accountNumber,
      investorPassword,
      isAdmin = 0,
      isApproved = 0,
    } = userData;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db
      .prepare(
        `INSERT INTO users 
        (username, email, password, name, accountId, server, accountNumber, investorPassword, isAdmin, isApproved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        username,
        email,
        hashedPassword,
        name || username,
        accountId || null,
        server || null,
        accountNumber || null,
        investorPassword || null,
        isAdmin,
        isApproved,
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
      ...values,
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
        "SELECT id, username, email, name, accountId, server, accountNumber, investorPassword, isAdmin, isApproved, createdAt FROM users WHERE isApproved = 0 ORDER BY createdAt DESC",
      )
      .all();
  },

  getAll: () => {
    return db
      .prepare(
        "SELECT id, username, email, name, accountId, server, accountNumber, investorPassword, isAdmin, isApproved, createdAt FROM users ORDER BY createdAt DESC",
      )
      .all();
  },

  updatePassword: (id, newPassword) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return userModel.update(id, { password: hashedPassword });
  },
};

// ------------------------
// Ensure admin user from environment
// ------------------------
export const ensureAdminUser = () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminEmail || !adminPassword) {
    console.warn(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to create admin user.",
    );
    return;
  }

  const existing = userModel.findByEmail(adminEmail);
  if (!existing) {
    userModel.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      isAdmin: 1,
      isApproved: 1,
    });
    console.log("✅ Admin user created from environment variables.");
  }
};
