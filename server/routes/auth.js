import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../middleware/errorHandler.js";
import { userModel } from "../database/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * Public signup endpoint - creates unapproved user
 */
router.post("/signup", async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      name,
      accountId,
      server,
      accountNumber,
      investorPassword,
    } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      !server ||
      !accountNumber ||
      !investorPassword
    ) {
      throw new ApiError(
        400,
        "Username, email, password, server, account number, and investor password are required",
      );
    }

    // Check if user exists
    const existingByUsername = await userModel.findByUsername(username);
    const existingByEmail = await userModel.findByEmail(email);

    if (existingByUsername || existingByEmail) {
      throw new ApiError(409, "User already exists");
    }

    // Create new user (first user becomes admin and auto-approved)
    const newUser = await userModel.create({
      username,
      email,
      password,
      name: name || username,
      accountId: accountId || null,
      server,
      accountNumber,
      investorPassword,
    });

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please wait for admin approval to login.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        isApproved: newUser.isApproved,
        server: newUser.server,
        accountNumber: newUser.accountNumber,
        investorPassword: newUser.investorPassword,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login endpoint - only approved users can login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, "Username and password are required");
    }

    // Find user by username or email
    const user = await userModel.findByUsernameOrEmail(username);

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check if user is approved
    if (!user.isApproved) {
      throw new ApiError(
        403,
        "Your account is pending approval. Please wait for admin approval.",
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        accountId: user.accountId,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        accountId: user.accountId,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        accountId: user.accountId,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/pending-users
 * Get all pending users (admin only)
 */
router.get("/pending-users", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }

    const pendingUsers = await userModel.getAllPending();

    res.json({
      success: true,
      users: pendingUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        accountId: u.accountId,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/users
 * Get all users (admin only)
 */
router.get("/users", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }

    const users = await userModel.getAll();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/approve-user/:id
 * Approve a pending user (admin only)
 */
router.post("/approve-user/:id", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }

    const userId = parseInt(req.params.id);
    const updatedUser = await userModel.approve(userId);

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      message: "User approved successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        isApproved: updatedUser.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/reject-user/:id
 * Reject/delete a pending user (admin only)
 */
router.delete("/reject-user/:id", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }

    const userId = parseInt(req.params.id);

    // Don't allow deleting admin users
    const targetUser = await userModel.findById(userId);
    if (targetUser && targetUser.isAdmin) {
      throw new ApiError(400, "Cannot delete admin user");
    }

    await userModel.reject(userId);

    res.json({
      success: true,
      message: "User rejected and removed successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/update-user/:id
 * Update user account ID (admin only)
 */
router.put("/update-user/:id", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    const user = await userModel.findById(req.user.id);
    if (!user || !user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }

    const userId = parseInt(req.params.id);
    const { accountId } = req.body;

    if (!accountId) {
      throw new ApiError(400, "Account ID is required");
    }

    const updatedUser = await userModel.update(userId, { accountId });

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        accountId: updatedUser.accountId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
