import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler.js";
import { userModel } from "../database/db.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return next(new ApiError(401, "Access token required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data from database
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (!user.isApproved) {
      return next(new ApiError(403, "Account pending approval"));
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      username: user.username,
      accountId: user.accountId,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    return next(new ApiError(403, "Invalid or expired token"));
  }
};
