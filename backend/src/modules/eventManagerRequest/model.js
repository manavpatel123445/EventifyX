import mongoose from "mongoose";

const eventManagerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Reason for requesting event manager role is required"],
      trim: true,
      minlength: [10, "Reason must be at least 10 characters long"],
      maxlength: [500, "Reason must not exceed 500 characters"],
    },
    experience: {
      type: String,
      trim: true,
      maxlength: [1000, "Experience must not exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [500, "Admin response must not exceed 500 characters"],
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

eventManagerRequestSchema.index({ status: 1 });

eventManagerRequestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email profileImage",
  }).populate({
    path: "processedBy",
    select: "name email",
  });
  next();
});

export const EventManagerRequest = mongoose.model(
  "EventManagerRequest",
  eventManagerRequestSchema,
  "eventmanagerrequests"
);

export default EventManagerRequest;
