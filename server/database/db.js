import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Create Prisma Client instance
export const prisma = new PrismaClient();

// Initialize database (create tables if needed - handled by Prisma migrations)
export async function initDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// ------------------------
// User Model
// ------------------------
export const userModel = {
  findByUsername: async (username) => {
    return await prisma.user.findUnique({
      where: { username },
    });
  },

  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
  },

  findByUsernameOrEmail: async (identifier) => {
    return await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
  },

  create: async (userData) => {
    const {
      username,
      email,
      password,
      name,
      accountId,
      server,
      accountNumber,
      investorPassword,
      isAdmin = false,
      isApproved = false,
    } = userData;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: name || username,
        accountId: accountId || null,
        server: server || null,
        accountNumber: accountNumber || null,
        investorPassword: investorPassword || null,
        isAdmin,
        isApproved,
      },
    });

    return user;
  },

  update: async (id, updates) => {
    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, updatedAt, ...updateData } = updates;

    if (Object.keys(updateData).length === 0) return null;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return user;
  },

  approve: async (id) => {
    return await userModel.update(id, { isApproved: true });
  },

  reject: async (id) => {
    return await prisma.user.deleteMany({
      where: {
        id: parseInt(id),
        isAdmin: false,
      },
    });
  },

  getAllPending: async () => {
    return await prisma.user.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        accountId: true,
        server: true,
        accountNumber: true,
        investorPassword: true,
        isAdmin: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getAll: async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        accountId: true,
        server: true,
        accountNumber: true,
        investorPassword: true,
        isAdmin: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updatePassword: async (id, newPassword) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return await userModel.update(id, { password: hashedPassword });
  },
};

// ------------------------
// Ensure admin user from environment
// ------------------------
export const ensureAdminUser = async () => {
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

  const existing = await userModel.findByEmail(adminEmail);
  if (!existing) {
    await userModel.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      isAdmin: true,
      isApproved: true,
    });
    console.log("✅ Admin user created from environment variables.");
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
