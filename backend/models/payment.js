import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    stripeSessionId: {
      type: String,
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ind",
    },
    status: {
      type: String,
      enum: ["pending", "reserved", "succeeded", "failed", "refunded", "cancelled", "expired"],
      default: "pending",
    },
    reservedAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
    receiptUrl: {
      type: String,
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
