import mongoose from "mongoose";

// Event Schema - for approved events
const eventSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: "Event date must be in the future"
      }
    },
     endDate: {
      type: Date,
      required: [true, "Event End date is required"],
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
      state: {
        type: String,
        required: [true, "State is required"]
    },
  },
    ticketPricing: [{
      type: {
        type: String,
        required: true,
        enum: ["regular", "vip", "premium"]
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
      },
      sold: {
        type: Number,
        default: 0,
        min: [0, "Sold tickets cannot be negative"]
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
    
    // Event Manager - user who created the event request and became manager after approval
    eventManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    // Event status
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    },
    
    // Event settings
    isPublic: {
      type: Boolean,
      default: true
    },
    
    
    
    // Statistics
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, "Total bookings cannot be negative"]
    },
    
    totalRevenue: {
      type: Number,
      default: 0,
      min: [0, "Total revenue cannot be negative"]
    },
    
    // SEO and search
    slug: {
      type: String,
      unique: true
    },
    
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Reference to original request
    originalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRequest"
    },
    
    // Admin who approved this event
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    approvedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create slug from title before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
      + '-' + Date.now();
  }
  
  // Validate end time is after start time
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

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ eventManager: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ 'venue.city': 1, date: 1 });
eventSchema.index({ tags: 1 });

// Method to calculate available tickets for a specific type
eventSchema.methods.getAvailableTickets = function(ticketType) {
  const ticket = this.ticketPricing.find(t => t.type === ticketType);
  return ticket ? ticket.quantity - ticket.sold : 0;
};

// Method to get total available tickets
eventSchema.methods.getTotalAvailableTickets = function() {
  if (!Array.isArray(this.ticketPricing)) return 0;
  return this.ticketPricing.reduce((total, ticket) => {
    return total + (ticket.quantity - ticket.sold);
  }, 0);
};

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.getTotalAvailableTickets() === 0;
});

// Virtual for getting event duration in hours
eventSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return (endMinutes - startMinutes) / 60;
});

// Ensure virtuals are included in JSON output
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export default mongoose.model("Event", eventSchema);
