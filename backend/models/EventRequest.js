import mongoose from "mongoose";

// Event Request Schema - for events pending admin approval
const eventRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must not exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description must not exceed 2000 characters"]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: "Event date must be in the future"
      }
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"]
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"]
    },
    venue: {
      name: {
        type: String,
        required: [true, "Venue name is required"]
      },
      address: {
        type: String,
        required: [true, "Venue address is required"]
      },
      city: {
        type: String,
        required: [true, "City is required"]
      },
      capacity: {
        type: Number,
        required: [true, "Venue capacity is required"],
        min: [1, "Capacity must be at least 1"]
      }
    },
    ticketPricing: [{
      type: {
        type: String,
        required: true,
        enum: ["early_bird", "regular", "vip", "premium"]
      },
      price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"]
      }
    }],
    images: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Please provide a valid image URL"
      }
    }],
    
    // Request specific fields
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    adminNotes: {
      type: String,
      maxlength: [500, "Admin notes must not exceed 500 characters"]
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    },
    
    // If approved, reference to the created event
    approvedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }
  },
  { timestamps: true }
);

// Index for better query performance
eventRequestSchema.index({ status: 1, createdAt: -1 });
eventRequestSchema.index({ requestedBy: 1 });

// Middleware to validate end time is after start time
eventRequestSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

export default mongoose.model("EventRequest", eventRequestSchema);
