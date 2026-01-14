#!/usr/bin/env node

/**
 * User Management Utility
 *
 * Usage:
 *   node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME"
 *   node utils/manageUsers.js list
 *   node utils/manageUsers.js remove --username USERNAME
 *   node utils/manageUsers.js update --username USERNAME --field VALUE
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = path.join(__dirname, "../routes/auth.js");

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};

  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }

  return { command, options };
}

// Read current users from auth.js
function readUsers() {
  try {
    const content = fs.readFileSync(AUTH_FILE, "utf8");
    const match = content.match(/const investors = \[([\s\S]*?)\];/);

    if (!match) {
      throw new Error("Could not find investors array in auth.js");
    }

    // Extract user objects (simple parsing - works for current format)
    const usersText = match[1];
    const users = [];
    const userRegex = /\{[\s\S]*?\}/g;
    let userMatch;

    while ((userMatch = userRegex.exec(usersText)) !== null) {
      const userText = userMatch[0];
      const idMatch = userText.match(/id:\s*"([^"]+)"/);
      const usernameMatch = userText.match(/username:\s*"([^"]+)"/);
      const emailMatch = userText.match(/email:\s*"([^"]+)"/);
      const passwordMatch = userText.match(/password:\s*"([^"]+)"/);
      const accountIdMatch = userText.match(/accountId:\s*"([^"]+)"/);
      const nameMatch = userText.match(/name:\s*"([^"]+)"/);

      if (usernameMatch) {
        users.push({
          id: idMatch ? idMatch[1] : String(users.length + 1),
          username: usernameMatch[1],
          email: emailMatch ? emailMatch[1] : "",
          password: passwordMatch ? passwordMatch[1] : "",
          accountId: accountIdMatch ? accountIdMatch[1] : "",
          name: nameMatch ? nameMatch[1] : usernameMatch[1],
        });
      }
    }

    return users;
  } catch (error) {
    console.error("Error reading users:", error.message);
    return [];
  }
}

// Write users back to auth.js
function writeUsers(users) {
  try {
    let content = fs.readFileSync(AUTH_FILE, "utf8");

    // Generate users array string
    const usersArray = users
      .map(
        (user) => `  {
    id: "${user.id}",
    username: "${user.username}",
    email: "${user.email}",
    password: "${user.password}", // bcrypt hash
    accountId: "${user.accountId}",
    name: "${user.name}",
  }`
      )
      .join(",\n");

    // Replace the investors array
    content = content.replace(
      /const investors = \[[\s\S]*?\];/,
      `const investors = [\n${usersArray}\n];`
    );

    fs.writeFileSync(AUTH_FILE, content, "utf8");
    return true;
  } catch (error) {
    console.error("Error writing users:", error.message);
    return false;
  }
}

// Add a new user
async function addUser(options) {
  const { username, email, password, accountId, name } = options;

  if (!username || !email || !password || !accountId) {
    console.error(
      "❌ Error: username, email, password, and accountId are required"
    );
    console.log("\nUsage:");
    console.log(
      '  node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME"'
    );
    process.exit(1);
  }

  const users = readUsers();

  // Check if user exists
  if (users.find((u) => u.username === username || u.email === email)) {
    console.error(
      `❌ Error: User with username "${username}" or email "${email}" already exists`
    );
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add new user
  const newUser = {
    id: String(users.length + 1),
    username,
    email,
    password: hashedPassword,
    accountId,
    name: name || username,
  };

  users.push(newUser);

  if (writeUsers(users)) {
    console.log("✅ User added successfully!");
    console.log(`\nUser Details:`);
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Account ID: ${accountId}`);
    console.log(`\n⚠️  Share these credentials securely with the client:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
  } else {
    console.error("❌ Failed to add user");
    process.exit(1);
  }
}

// List all users
function listUsers() {
  const users = readUsers();

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  console.log(`\n📋 Found ${users.length} user(s):\n`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.username})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Account ID: ${user.accountId}`);
    console.log(`   ID: ${user.id}\n`);
  });
}

// Remove a user
function removeUser(options) {
  const { username } = options;

  if (!username) {
    console.error("❌ Error: username is required");
    console.log("\nUsage:");
    console.log("  node utils/manageUsers.js remove --username USERNAME");
    process.exit(1);
  }

  const users = readUsers();
  const filteredUsers = users.filter((u) => u.username !== username);

  if (users.length === filteredUsers.length) {
    console.error(`❌ Error: User "${username}" not found`);
    process.exit(1);
  }

  if (writeUsers(filteredUsers)) {
    console.log(`✅ User "${username}" removed successfully!`);
  } else {
    console.error("❌ Failed to remove user");
    process.exit(1);
  }
}

// Update a user field
async function updateUser(options) {
  const { username, ...updates } = options;

  if (!username) {
    console.error("❌ Error: username is required");
    console.log("\nUsage:");
    console.log(
      "  node utils/manageUsers.js update --username USERNAME --email NEW_EMAIL"
    );
    console.log(
      "  node utils/manageUsers.js update --username USERNAME --password NEW_PASSWORD"
    );
    console.log(
      "  node utils/manageUsers.js update --username USERNAME --accountId NEW_ACCOUNT_ID"
    );
    console.log(
      '  node utils/manageUsers.js update --username USERNAME --name "NEW NAME"'
    );
    process.exit(1);
  }

  const users = readUsers();
  const userIndex = users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    console.error(`❌ Error: User "${username}" not found`);
    process.exit(1);
  }

  const user = users[userIndex];

  // Update fields
  if (updates.email) user.email = updates.email;
  if (updates.accountId) user.accountId = updates.accountId;
  if (updates.name) user.name = updates.name;

  if (updates.password) {
    user.password = await bcrypt.hash(updates.password, 10);
  }

  users[userIndex] = user;

  if (writeUsers(users)) {
    console.log(`✅ User "${username}" updated successfully!`);
  } else {
    console.error("❌ Failed to update user");
    process.exit(1);
  }
}

// Main execution
async function main() {
  const { command, options } = parseArgs();

  switch (command) {
    case "add":
      await addUser(options);
      break;
    case "list":
      listUsers();
      break;
    case "remove":
      removeUser(options);
      break;
    case "update":
      await updateUser(options);
      break;
    default:
      console.log("User Management Utility\n");
      console.log("Usage:");
      console.log(
        '  node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME"'
      );
      console.log("  node utils/manageUsers.js list");
      console.log("  node utils/manageUsers.js remove --username USERNAME");
      console.log(
        "  node utils/manageUsers.js update --username USERNAME --field VALUE"
      );
      console.log("\nExamples:");
      console.log(
        '  node utils/manageUsers.js add --username client1 --email client1@example.com --password SecurePass123 --accountId abc-123-def --name "John Doe"'
      );
      console.log(
        "  node utils/manageUsers.js update --username client1 --password NewPassword123"
      );
      console.log("  node utils/manageUsers.js remove --username client1");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
