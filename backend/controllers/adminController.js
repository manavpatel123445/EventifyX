import User from "../models/User.js";
import Event from "../models/Event.js";
import EventRequest from "../models/EventRequest.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

// 📊 Get Admin Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [userStats, eventStats, requestStats, revenueStats] = await Promise.all([
      // User Statistics
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Event Statistics
      Event.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Event Request Statistics
      EventRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Revenue Statistics
      Event.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalRevenue" },
            totalBookings: { $sum: "$totalBookings" },
            totalEvents: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format user stats
    const formattedUserStats = {
      total: 0,
      users: 0,
      eventManagers: 0,
      admins: 0
    };

    userStats.forEach(stat => {
      formattedUserStats.total += stat.count;
      switch(stat._id) {
        case 'user':
          formattedUserStats.users = stat.count;
          break;
        case 'event_manager':
          formattedUserStats.eventManagers = stat.count;
          break;
        case 'admin':
          formattedUserStats.admins = stat.count;
          break;
      }
    });

    // Format event stats
    const formattedEventStats = {
      total: 0,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0
    };

    eventStats.forEach(stat => {
      formattedEventStats.total += stat.count;
      formattedEventStats[stat._id] = stat.count;
    });

    // Format request stats
    const formattedRequestStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    requestStats.forEach(stat => {
      formattedRequestStats.total += stat.count;
      formattedRequestStats[stat._id] = stat.count;
    });

    // Get recent activities
    const recentRequests = await EventRequest.find()
      .populate('requestedBy', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEvents = await Event.find()
      .populate('eventManager', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: formattedUserStats,
        events: formattedEventStats,
        requests: formattedRequestStats,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          totalBookings: 0,
          totalEvents: 0
        },
        recentActivity: {
          recentRequests,
          recentEvents
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// 👥 Get All Users with Filters
export const getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      status, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Add filters
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .populate('managedEvents', 'title status')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// 🔄 Update User Status (Block/Unblock)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;  

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "blocked"'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// 🎭 Update User Role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'event_manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user", "event_manager", or "admin"'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    
    // If promoting to event_manager, set the timestamp
    if (role === 'event_manager' && oldRole !== 'event_manager') {
      user.becameManagerAt = new Date();
    }
    
    // If demoting from event_manager, clear managed events and timestamp
    if (oldRole === 'event_manager' && role === 'user') {
      user.managedEvents = [];
      user.becameManagerAt = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      data: user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// 🗑️ Delete User (Soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user has active events as event manager
    if (user.role === 'event_manager') {
      const activeEvents = await Event.countDocuments({
        eventManager: userId,
        status: { $in: ['upcoming', 'ongoing'] }
      });

      if (activeEvents > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete user. They have ${activeEvents} active event(s) as event manager.`
        });
      }
    }

    // For now, we'll just block the user instead of actual deletion
    user.status = 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account has been deactivated',
      data: user
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// 📋 Get User Details with their Events and Requests
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('managedEvents', 'title status date totalBookings totalRevenue');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's event requests
    const eventRequests = await EventRequest.find({ requestedBy: userId })
      .populate('category', 'name')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's managed events (if event manager)
    let managedEvents = [];
    if (user.role === 'event_manager') {
      managedEvents = await Event.find({ eventManager: userId })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        eventRequests,
        managedEvents
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// 🏷️ Category Management
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const existingCategory = await Category.findOne({ 
      name: new RegExp(name, 'i') 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({ name, description });
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: new RegExp(name, 'i'),
        _id: { $ne: categoryId }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
    if (name) category.name = name;
    if (description) category.description = description;
    
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category has events
    const eventCount = await Event.countDocuments({ category: categoryId });
    const requestCount = await EventRequest.countDocuments({ category: categoryId });
    
    if (eventCount > 0 || requestCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${eventCount} events and ${requestCount} event requests.`
      });
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// 📊 Advanced Analytics
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Event analytics by month
    const eventsByMonth = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalRevenue" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top categories
    const topCategories = await Event.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          eventCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalRevenue" },
          totalBookings: { $sum: "$totalBookings" }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ]);

    // Top event managers
    const topManagers = await Event.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: "users",
          localField: "eventManager",
          foreignField: "_id",
          as: "managerInfo"
        }
      },
      { $unwind: "$managerInfo" },
      {
        $group: {
          _id: {
            id: "$managerInfo._id",
            name: "$managerInfo.name",
            email: "$managerInfo.email"
          },
          eventCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalRevenue" },
          totalBookings: { $sum: "$totalBookings" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        eventsByMonth,
        topCategories,
        topManagers
      }
    });

  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};
