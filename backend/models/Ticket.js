import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["early_bird", "regular", "vip", "premium"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "used", "cancelled", "refunded"],
      default: "active",
    },
    qrCode: {
      type: String,
    },
    seatNumber: {
      type: String,
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

// Performance Indexes
ticketSchema.index({ user: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ payment: 1 });
ticketSchema.index({ status: 1 });

export default mongoose.model("Ticket", ticketSchema);
