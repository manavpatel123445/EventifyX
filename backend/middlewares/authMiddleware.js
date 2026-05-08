import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid. User not found."
        });
      }

      // Check if user is blocked
      if (user.status === "blocked") {
        return res.status(401).json({
          success: false,
          message: "Your account has been blocked. Please contact support."
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired."
      });
    }

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Optional authentication - adds user to req if token exists but doesn't fail if missing
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (user && user.status === "active") {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user owns the resource
export const checkOwnership = (modelName, paramName = "id", userField = "user") => {
  return async (req, res, next) => {
    try {
      const Model = (await import(`../models/${modelName}.js`)).default;
      const resourceId = req.params[paramName];
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }

      // Check if user owns the resource or is admin
      const resourceUserId = resource[userField]?.toString();
      const requestUserId = req.user._id.toString();
      
      if (resourceUserId !== requestUserId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources."
        });
      }

      // Add resource to request for use in controller
      req.resource = resource;
      next();

    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking resource ownership"
      });
    }
  };
};
