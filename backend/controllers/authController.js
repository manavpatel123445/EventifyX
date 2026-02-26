import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";




const generateAccessToken = (user) => {
	return jwt.sign(
		{ id: user._id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
	);
};

const generateRefreshToken = (user) => {
	const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
	if (!secret) throw new Error("REFRESH_TOKEN_SECRET or JWT_SECRET must be set");
	return jwt.sign(
		{ id: user._id, role: user.role },
		secret,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
	);
};

export const register = async (req, res) => {
	try {
		const { name, email, password, phone } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ success: false, message: "Name, email, and password are required" });
		}
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ success: false, message: "Email already registered" });
		}
		const user = await User.create({ name, email, password, phone });
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		res.status(201).json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				profileImage: user.profileImage
			},
			accessToken,
			refreshToken
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ success: false, message: "Email and password are required" });
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}
		if (user.status === "blocked") {
			return res.status(403).json({ success: false, message: "Account is blocked" });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ success: false, message: "Invalid credentials" });
		}
		user.lastLogin = new Date();
		await user.save();
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		res.json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				
			},
			accessToken,
			refreshToken
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: "Invalid refresh token" });

      const user = await User.findById(decoded.id);
      if (!user || user.status === "blocked") {
        return res.status(401).json({ success: false, message: "User not found or blocked" });
      }

      const accessToken = generateAccessToken(user);
      res.json({ success: true, accessToken });
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user (requires auth)
// @access  Private
export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		res.json({ success: true, user });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @route   POST /api/auth/create-admin
// @desc    Create admin user (TEMPORARY - REMOVE IN PRODUCTION)
// @access  Public (should be protected in production)
export const createAdmin = async (req, res) => {
	try {
		const { name, email, password, adminSecret } = req.body;
		
		// Simple secret check (replace with proper authentication)
		if (adminSecret !== process.env.ADMIN_SECRET || !process.env.ADMIN_SECRET) {
			return res.status(403).json({ 
				success: false, 
				message: "Invalid admin secret" 
			});
		}
		
		if (!name || !email || !password) {
			return res.status(400).json({ 
				success: false, 
				message: "Name, email, and password are required" 
			});
		}
		
		// Check if admin already exists
		const existingAdmin = await User.findOne({ 
			$or: [
				{ email },
				{ role: 'admin' }
			]
		});
		
		if (existingAdmin) {
			return res.status(400).json({ 
				success: false, 
				message: "Admin user already exists" 
			});
		}
		
		// Create admin user
		const user = await User.create({ 
			name, 
			email, 
			password, 
			role: 'admin',
			status: 'active'
		});
		
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);
		
		res.status(201).json({
			success: true,
			message: "Admin user created successfully",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				profileImage: user.profileImage
			},
			accessToken,
			refreshToken
		});
		
	} catch (error) {
		console.error('Create admin error:', error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ 
				success: false, 
				message: "Email is required" 
			});
		}
		
		const user = await User.findOne({ email });
		
		if (!user) {
			// Don't reveal that user doesn't exist for security reasons
			return res.json({
				success: true,
				message: "If an account with that email exists, we have sent a password reset link"
			});
		}
		
		// Get reset token
		const resetToken = user.getResetPasswordToken();
		
		await user.save({ validateBeforeSave: false });
		
		// For development purposes, we'll return the reset token in response
		// In production, you would send this via email
		res.json({
			success: true,
			message: "Password reset link sent to email",
			// TODO: Remove this in production - only for development
			resetToken: resetToken
		});
		
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
// @access  Public
export const resetPassword = async (req, res) => {
	try {
		const { resettoken } = req.params;
		const { password } = req.body;
		
		if (!password) {
			return res.status(400).json({ 
				success: false, 
				message: "Password is required" 
			});
		}
		
		if (password.length < 6) {
			return res.status(400).json({ 
				success: false, 
				message: "Password must be at least 6 characters long" 
			});
		}
		
		// Find all users and check which one has the matching reset token
		const users = await User.find({
			resetPasswordExpire: { $gt: Date.now() }
		});
		
		let user = null;
		for (let u of users) {
			if (u.resetPasswordToken && bcrypt.compareSync(resettoken, u.resetPasswordToken)) {
				user = u;
				break;
			}
		}
		
		if (!user) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid or expired password reset token" 
			});
		}
		
		// Set new password
		user.password = password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		
		await user.save();
		
		res.json({
			success: true,
			message: "Password reset successful"
		});
		
	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
 