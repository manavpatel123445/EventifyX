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
	return jwt.sign(
		{ id: user._id, role: user.role },
		process.env.REFRESH_TOKEN_SECRET,
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
 