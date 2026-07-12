import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Event End date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Venue name is required"],
      },
      address: {
        type: String,
        required: [true, "Venue address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      capacity: {
        type: Number,
        required: [true, "Venue capacity is required"],
        min: [1, "Capacity must be at least 1"],
      },
    },
    ticketPricing: [
      {
        type: {
          type: String,
          required: true,
          enum: ["early_bird", "regular", "vip", "premium"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        sold: {
          type: Number,
          default: 0,
          min: [0, "Sold tickets cannot be negative"],
        },
      },
    ],
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Please provide a valid image URL",
        },
      },
    ],
    eventManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, "Total bookings cannot be negative"],
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: [0, "Total revenue cannot be negative"],
    },
    slug: {
      type: String,
      unique: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    originalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRequest",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim() +
      "-" +
      Date.now();
  }
  next();
});

eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ eventManager: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isDeleted: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

export const Event = mongoose.model("Event", eventSchema);

const eventRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Venue name is required"],
      },
      address: {
        type: String,
        required: [true, "Venue address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      capacity: {
        type: Number,
        required: [true, "Venue capacity is required"],
        min: [1, "Capacity must be at least 1"],
      },
    },
    ticketPricing: [
      {
        type: {
          type: String,
          required: true,
          enum: ["early_bird", "regular", "vip", "premium"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Please provide a valid image URL",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      maxlength: [500, "Admin notes must not exceed 500 characters"],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    approvedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

eventRequestSchema.index({ status: 1, createdAt: -1 });
eventRequestSchema.index({ requestedBy: 1 });

eventRequestSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(":").map(Number);
    const [endHour, endMin] = this.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return next(new Error("End time must be after start time"));
    }
  }
  next();
});

export const EventRequest = mongoose.model("EventRequest", eventRequestSchema);

export default { Event, EventRequest };
