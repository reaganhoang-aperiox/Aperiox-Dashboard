#!/usr/bin/env node

/**
 * User Management Utility
 *
 * Usage:
 *   node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME"
 *   node utils/manageUsers.js list
 *   node utils/manageUsers.js remove --username USERNAME
 *   node utils/manageUsers.js update --username USERNAME --field VALUE
 *   node utils/manageUsers.js approve --username USERNAME
 *   node utils/manageUsers.js make-admin --username USERNAME
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

// Add a new user
async function addUser(options) {
  const { username, email, password, accountId, name, admin, approved } =
    options;

  if (!username || !email || !password) {
    console.error("❌ Error: username, email, and password are required");
    console.log("\nUsage:");
    console.log(
      '  node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME" --admin true --approved true',
    );
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      console.error(
        `❌ Error: User with username "${username}" or email "${email}" already exists`,
      );
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: name || username,
        accountId: accountId || null,
        isAdmin: admin === "true" || admin === "1",
        isApproved: approved === "true" || approved === "1" || true, // Default to approved
      },
    });

    console.log("✅ User added successfully!");
    console.log(`\nUser Details:`);
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Account ID: ${newUser.accountId || "Not set"}`);
    console.log(`  Admin: ${newUser.isAdmin ? "Yes" : "No"}`);
    console.log(`  Approved: ${newUser.isApproved ? "Yes" : "No"}`);
    console.log(`\n⚠️  Share these credentials securely with the client:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
  } catch (error) {
    console.error("❌ Failed to add user:", error.message);
    process.exit(1);
  }
}

// List all users
async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    console.log(`\n📋 Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.username}) ${user.isAdmin ? "👑 ADMIN" : ""}`,
      );
      console.log(`   Email: ${user.email}`);
      console.log(`   Account ID: ${user.accountId || "Not set"}`);
      console.log(`   Approved: ${user.isApproved ? "✅ Yes" : "⏳ Pending"}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   ID: ${user.id}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to list users:", error.message);
    process.exit(1);
  }
}

// Remove a user
async function removeUser(options) {
  const { username } = options;

  if (!username) {
    console.error("❌ Error: username is required");
    console.log("\nUsage:");
    console.log("  node utils/manageUsers.js remove --username USERNAME");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`❌ Error: User "${username}" not found`);
      process.exit(1);
    }

    await prisma.user.delete({
      where: { username },
    });

    console.log(`✅ User "${username}" removed successfully!`);
  } catch (error) {
    console.error("❌ Failed to remove user:", error.message);
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
      "  node utils/manageUsers.js update --username USERNAME --email NEW_EMAIL",
    );
    console.log(
      "  node utils/manageUsers.js update --username USERNAME --password NEW_PASSWORD",
    );
    console.log(
      "  node utils/manageUsers.js update --username USERNAME --accountId NEW_ACCOUNT_ID",
    );
    console.log(
      '  node utils/manageUsers.js update --username USERNAME --name "NEW NAME"',
    );
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`❌ Error: User "${username}" not found`);
      process.exit(1);
    }

    const updateData = {};

    if (updates.email) updateData.email = updates.email;
    if (updates.accountId) updateData.accountId = updates.accountId;
    if (updates.name) updateData.name = updates.name;
    if (updates.server) updateData.server = updates.server;
    if (updates.accountNumber) updateData.accountNumber = updates.accountNumber;
    if (updates.investorPassword)
      updateData.investorPassword = updates.investorPassword;

    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { username },
      data: updateData,
    });

    console.log(`✅ User "${username}" updated successfully!`);
    console.log(`\nUpdated fields:`);
    Object.keys(updateData).forEach((key) => {
      if (key !== "password") {
        console.log(`  ${key}: ${updatedUser[key]}`);
      } else {
        console.log(`  password: [updated]`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to update user:", error.message);
    process.exit(1);
  }
}

// Approve a user
async function approveUser(options) {
  const { username } = options;

  if (!username) {
    console.error("❌ Error: username is required");
    console.log("\nUsage:");
    console.log("  node utils/manageUsers.js approve --username USERNAME");
    process.exit(1);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { isApproved: true },
    });

    console.log(`✅ User "${username}" approved successfully!`);
  } catch (error) {
    console.error("❌ Failed to approve user:", error.message);
    process.exit(1);
  }
}

// Make user admin
async function makeAdmin(options) {
  const { username } = options;

  if (!username) {
    console.error("❌ Error: username is required");
    console.log("\nUsage:");
    console.log("  node utils/manageUsers.js make-admin --username USERNAME");
    process.exit(1);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { isAdmin: true, isApproved: true },
    });

    console.log(`✅ User "${username}" is now an admin!`);
  } catch (error) {
    console.error("❌ Failed to make user admin:", error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const { command, options } = parseArgs();

  try {
    await prisma.$connect();

    switch (command) {
      case "add":
        await addUser(options);
        break;
      case "list":
        await listUsers();
        break;
      case "remove":
        await removeUser(options);
        break;
      case "update":
        await updateUser(options);
        break;
      case "approve":
        await approveUser(options);
        break;
      case "make-admin":
        await makeAdmin(options);
        break;
      default:
        console.log("User Management Utility\n");
        console.log("Usage:");
        console.log(
          '  node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME" --admin true --approved true',
        );
        console.log("  node utils/manageUsers.js list");
        console.log("  node utils/manageUsers.js remove --username USERNAME");
        console.log(
          "  node utils/manageUsers.js update --username USERNAME --field VALUE",
        );
        console.log("  node utils/manageUsers.js approve --username USERNAME");
        console.log(
          "  node utils/manageUsers.js make-admin --username USERNAME",
        );
        console.log("\nExamples:");
        console.log(
          '  node utils/manageUsers.js add --username client1 --email client1@example.com --password SecurePass123 --accountId abc-123-def --name "John Doe"',
        );
        console.log(
          "  node utils/manageUsers.js update --username client1 --password NewPassword123",
        );
        console.log(
          "  node utils/manageUsers.js approve --username client1",
        );
        console.log(
          "  node utils/manageUsers.js make-admin --username client1",
        );
        console.log("  node utils/manageUsers.js remove --username client1");
        process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  prisma.$disconnect();
  process.exit(1);
});
