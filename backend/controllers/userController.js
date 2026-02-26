import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Get current user's profile
export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		// Sanitize legacy broken default image URL
		if (user.profileImage && typeof user.profileImage === 'string' && user.profileImage.includes('default-profile_qxqv2r.png')) {
			user.profileImage = '';
		}
		res.json({ success: true, user });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update current user's profile (not role)
export const updateProfile = async (req, res) => {
	try {
		const updates = { ...req.body };
		delete updates.role; // Prevent role change
		delete updates.status; // Prevent status change
		delete updates.password; // Password change handled elsewhere

		// Sanitize legacy broken default image URL in incoming updates
		if (typeof updates.profileImage === 'string' && updates.profileImage.includes('default-profile_qxqv2r.png')) {
			updates.profileImage = '';
		}
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updates },
			{ new: true, runValidators: true, select: "-password" }
		);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		if (user.profileImage && typeof user.profileImage === 'string' && user.profileImage.includes('default-profile_qxqv2r.png')) {
			user.profileImage = '';
		}
		res.json({ success: true, user });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Change password
export const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ 
				success: false, 
				message: "Current password and new password are required" 
			});
		}
		
		if (newPassword.length < 6) {
			return res.status(400).json({ 
				success: false, 
				message: "New password must be at least 6 characters long" 
			});
		}
		
		const user = await User.findById(req.user._id).select("+password");
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		
		const isMatch = await user.matchPassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ success: false, message: "Current password is incorrect" });
		}
		
		user.password = newPassword;
		await user.save();
		
		res.json({ success: true, message: "Password changed successfully" });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Soft delete (deactivate) own account
export const deleteAccount = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ status: "blocked" },
			{ new: true, select: "-password" }
		);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		res.json({ success: true, message: "Account deactivated", user });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Upload and set current user's profile image (avatar)
// Removed avatar upload handler to revert to client-side uploads
