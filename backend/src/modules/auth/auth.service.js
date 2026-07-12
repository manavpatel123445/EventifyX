import crypto from "crypto";
import jwt from "jsonwebtoken";
import authRepository from "./auth.repository.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";

export class AuthService {
  async registerUser({ name, email, password, phone }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Email already registered");
    }

    const user = await authRepository.create({ name, email, password, phone });
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
      },
      accessToken,
      refreshToken,
    };
  }

  async loginUser({ email, password }) {
    const user = await authRepository.findByEmail(email, "+password");
    if (!user) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid credentials");
    }

    if (user.status === "blocked") {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Account is blocked");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid credentials");
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(token) {
    if (!token) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Refresh token required");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await authRepository.findById(decoded.id || decoded._id);
      if (!user || user.status === "blocked") {
        throw new ApiError(STATUS_CODES.UNAUTHORIZED, "User not found or blocked");
      }

      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      return { accessToken };
    } catch (err) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid refresh token");
    }
  }

  async sendForgotPasswordEmail(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return "If an account with that email exists, we have sent a password reset link";
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    return "Password reset link sent to email";
  }

  async resetUserPassword(token, password) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid or expired password reset token");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return "Password reset successful";
  }
}

export const authService = new AuthService();
export default authService;
