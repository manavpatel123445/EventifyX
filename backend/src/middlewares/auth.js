import jwt from "jsonwebtoken";
import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import mongoose from "mongoose";

// We will fetch User from mongoose.models to prevent circular imports if modules imports auth.js
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, "Access denied. No token provided."));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const User = mongoose.model("User");
      const user = await User.findById(decoded.id || decoded._id).select("-password");

      if (!user) {
        return next(new ApiError(STATUS_CODES.UNAUTHORIZED, "Token is invalid. User not found."));
      }

      if (user.status === "blocked") {
        return next(new ApiError(STATUS_CODES.UNAUTHORIZED, "Your account has been blocked. Please contact support."));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, "Token is invalid or expired."));
    }
  } catch (error) {
    next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Authentication error"));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const User = mongoose.model("User");
        const user = await User.findById(decoded.id || decoded._id).select("-password");
        if (user && user.status !== "blocked") {
          req.user = user;
        }
      } catch (error) {
        // Fail silently for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};
export default { protect, optionalAuth };
