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
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "inr",
    },
    status: {
      type: String,
      enum: ["pending", "reserved", "succeeded", "failed", "refunded", "cancelled", "expired"],
      default: "pending",
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

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ event: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);

const stripeWebhookEventSchema = new mongoose.Schema(
  {
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

stripeWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const StripeWebhookEvent = mongoose.model("StripeWebhookEvent", stripeWebhookEventSchema);

export default { Payment, StripeWebhookEvent };
