import express from "express";
import {
  // Dashboard
  getDashboardStats,
  
  // User Management
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserDetails,
  
  // Category Management
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Analytics
  getAdvancedAnalytics,
  getRevenueAnalytics,
  getManagerRevenue
} from "../controllers/adminController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getPaymentLogs } from "../controllers/paymentController.js";

const router = express.Router();

// All admin routes require admin authorization
router.use(protect, authorize("admin"));


// DASHBOARD ROUTES

// Get dashboard statistics
// GET /api/admin/dashboard
router.get("/dashboard", getDashboardStats);

// Get advanced analytics
// GET /api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31
router.get("/analytics", getAdvancedAnalytics);

// Get revenue analytics
// GET /api/admin/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31&managerId=xxx
router.get("/analytics/revenue", getRevenueAnalytics);

// Get manager revenue
// GET /api/admin/analytics/manager/:managerId/revenue?startDate=2024-01-01&endDate=2024-12-31
router.get("/analytics/manager/:managerId/revenue", getManagerRevenue);

// USER MANAGEMENT ROUTES


// Get all users with filters
// GET /api/admin/users?role=user&status=active&search=john&page=1&limit=20
router.get("/users", getAllUsers);

// Get specific user details
// GET /api/admin/users/:userId
router.get("/users/:userId", getUserDetails);

// Update user status (block/unblock)
// PATCH /api/admin/users/:userId/status
router.patch("/users/:userId/status", updateUserStatus);

// Update user role
// PATCH /api/admin/users/:userId/role
router.patch("/users/:userId/role", updateUserRole);

// Delete user (soft delete)
// DELETE /api/admin/users/:userId
router.delete("/users/:userId", deleteUser);

// =============================================================================
// CATEGORY MANAGEMENT ROUTES
// =============================================================================

// Get all categories
// GET /api/admin/categories
router.get("/categories", getAllCategories);

// Create new category
// POST /api/admin/categories
router.post("/categories", createCategory);

// Update category
// PUT /api/admin/categories/:categoryId
router.put("/categories/:categoryId", updateCategory);

// Delete category
// DELETE /api/admin/categories/:categoryId
router.delete("/categories/:categoryId", deleteCategory);

// =============================================================================
// PAYMENTS LOGS (Admin)
// =============================================================================
// GET /api/admin/payments/logs
router.get("/payments/logs", getPaymentLogs);

export default router;
