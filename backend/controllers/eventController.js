import Event from "../models/Event.js";
import EventRequest from "../models/EventRequest.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

// 📝 Create Event Request (User submits request to admin)
export const createEventRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venue,
      ticketPricing,
      images,
      registrationDeadline,
      tags
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected"
      });
    }

    // Create event request
    const eventRequest = new EventRequest({
      title,
      description,
      category,
      date: new Date(date),
      startTime,
      endTime,
      venue,
      ticketPricing,
      images: images || [],
      requestedBy: req.user._id,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      tags: tags || []
    });

    await eventRequest.save();
    await eventRequest.populate([
      { path: "requestedBy", select: "name email" },
      { path: "category", select: "name" }
    ]);

    res.status(201).json({
      success: true,
      message: "Event request submitted successfully! Waiting for admin approval.",
      data: eventRequest
    });

  } catch (error) {
    console.error("Create event request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit event request"
    });
  }
};

// 📋 Get All Event Requests (Admin only)
export const getAllEventRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const eventRequests = await EventRequest.find(filter)
      .populate("requestedBy", "name email")
      .populate("category", "name")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        requests: eventRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error("Get event requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event requests"
    });
  }
};

// ✅ Approve Event Request (Admin only)
export const approveEventRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    // Find the event request
    const eventRequest = await EventRequest.findById(requestId).session(session);
    
    if (!eventRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event request not found"
      });
    }

    if (eventRequest.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Event request has already been reviewed"
      });
    }

    // Create the approved event
    const approvedEvent = new Event({
      title: eventRequest.title,
      description: eventRequest.description,
      category: eventRequest.category,
      date: eventRequest.date,
      startTime: eventRequest.startTime,
      endTime: eventRequest.endTime,
      venue: eventRequest.venue,
      ticketPricing: eventRequest.ticketPricing,
      images: eventRequest.images,
      eventManager: eventRequest.requestedBy,
      originalRequest: eventRequest._id,
      approvedBy: req.user._id,
      registrationDeadline: eventRequest.registrationDeadline,
      tags: eventRequest.tags
    });

    await approvedEvent.save({ session });

    // Update the user role to event_manager and add managed event
    const user = await User.findById(eventRequest.requestedBy).session(session);
    
    // If user is not already an event manager, update their role
    if (user.role === "user") {
      user.role = "event_manager";
      user.becameManagerAt = new Date();
    }
    
    // Add this event to their managed events
    if (!user.managedEvents.includes(approvedEvent._id)) {
      user.managedEvents.push(approvedEvent._id);
    }
    
    await user.save({ session });

    // Update event request status
    eventRequest.status = "approved";
    eventRequest.adminNotes = adminNotes || "";
    eventRequest.reviewedBy = req.user._id;
    eventRequest.reviewedAt = new Date();
    eventRequest.approvedEvent = approvedEvent._id;
    
    await eventRequest.save({ session });

    await session.commitTransaction();

    // Populate response data
    await approvedEvent.populate([
      { path: "eventManager", select: "name email" },
      { path: "category", select: "name" },
      { path: "approvedBy", select: "name" }
    ]);

    res.status(200).json({
      success: true,
      message: "Event request approved successfully! User is now an Event Manager.",
      data: {
        event: approvedEvent,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          managedEvents: user.managedEvents
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Approve event request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve event request"
    });
  } finally {
    session.endSession();
  }
};

// ❌ Reject Event Request (Admin only)
export const rejectEventRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const eventRequest = await EventRequest.findById(requestId);
    
    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        message: "Event request not found"
      });
    }

    if (eventRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Event request has already been reviewed"
      });
    }

    // Update event request status
    eventRequest.status = "rejected";
    eventRequest.adminNotes = adminNotes || "No specific reason provided";
    eventRequest.reviewedBy = req.user._id;
    eventRequest.reviewedAt = new Date();
    
    await eventRequest.save();
    await eventRequest.populate([
      { path: "requestedBy", select: "name email" },
      { path: "reviewedBy", select: "name" }
    ]);

    res.status(200).json({
      success: true,
      message: "Event request rejected",
      data: eventRequest
    });

  } catch (error) {
    console.error("Reject event request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject event request"
    });
  }
};

// 📊 Get User's Event Requests
export const getMyEventRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { requestedBy: req.user._id };
    if (status) filter.status = status;

    const eventRequests = await EventRequest.find(filter)
      .populate("category", "name")
      .populate("reviewedBy", "name")
      .populate("approvedEvent", "title slug")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        requests: eventRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error("Get my event requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your event requests"
    });
  }
};

// 📅 Get All Approved Events (Public)
export const getAllEvents = async (req, res) => {
  try {
    const { 
      category, 
      city, 
      date, 
      status = "upcoming", 
      search,
      page = 1, 
      limit = 12,
      sortBy = "date",
      sortOrder = "asc"
    } = req.query;
    
    const filter = { status, isPublic: true };
    
    // Add filters
    if (category) filter.category = category;
    if (city) filter["venue.city"] = new RegExp(city, "i");
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: searchDate, $lt: nextDay };
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const events = await Event.find(filter)
      .populate("eventManager", "name")
      .populate("category", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events"
    });
  }
};

// 🎯 Get Single Event by ID or Slug
export const getEventById = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be ID or slug
    
    const query = mongoose.isValidObjectId(identifier) 
      ? { _id: identifier }
      : { slug: identifier };

    const event = await Event.findOne(query)
      .populate("eventManager", "name email phone profileImage")
      .populate("category", "name description")
      .populate("approvedBy", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event"
    });
  }
};

// 🏠 Get Events Managed by Current User (Event Manager only)
export const getMyManagedEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { eventManager: req.user._id };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    // Calculate stats
    const stats = await Event.aggregate([
      { $match: { eventManager: req.user._id } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalRevenue: { $sum: "$totalRevenue" },
          totalBookings: { $sum: "$totalBookings" },
          upcomingEvents: {
            $sum: { $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0] }
          },
          completedEvents: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        events,
        stats: stats[0] || {
          totalEvents: 0,
          totalRevenue: 0,
          totalBookings: 0,
          upcomingEvents: 0,
          completedEvents: 0
        },
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error("Get managed events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your managed events"
    });
  }
};

// ✏️ Update Event (Event Manager only - their own events)
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ 
      _id: eventId, 
      eventManager: req.user._id 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to edit this event"
      });
    }

    // Don't allow updates to completed or cancelled events
    if (event.status === "completed" || event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update completed or cancelled events"
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "title", "description", "venue", "images", 
      "registrationDeadline", "tags", "isPublic"
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: "eventManager", select: "name email" },
      { path: "category", select: "name" }
    ]);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });

  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update event"
    });
  }
};

// 🗑️ Cancel Event (Event Manager only - their own events)
export const cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    
    const event = await Event.findOne({ 
      _id: eventId, 
      eventManager: req.user._id 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to cancel this event"
      });
    }

    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Can only cancel upcoming events"
      });
    }

    event.status = "cancelled";
    // You might want to add a cancellation reason field to the schema
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data: event
    });

  } catch (error) {
    console.error("Cancel event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel event"
    });
  }
};

// 📈 Get Event Statistics (Event Manager - their own events)
export const getEventStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({ 
      _id: eventId, 
      eventManager: req.user._id 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to view stats"
      });
    }

    // Calculate detailed statistics
    const stats = {
      basicInfo: {
        title: event.title,
        status: event.status,
        date: event.date,
        totalCapacity: event.venue.capacity
      },
      tickets: {
        totalSold: event.totalBookings,
        totalRevenue: event.totalRevenue,
        availableTickets: event.getTotalAvailableTickets(),
        ticketTypes: event.ticketPricing.map(ticket => ({
          type: ticket.type,
          price: ticket.price,
          total: ticket.quantity,
          sold: ticket.sold,
          available: ticket.quantity - ticket.sold,
          revenue: ticket.sold * ticket.price
        }))
      },
      occupancy: {
        percentage: ((event.totalBookings / event.venue.capacity) * 100).toFixed(2),
        remaining: event.venue.capacity - event.totalBookings
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Get event stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event statistics"
    });
  }
};
