import Stripe from "stripe";
import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

const stripe = new Stripe(config.stripe.secretKey);

export const verifyStripeWebhook = (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return next(new ApiError(STATUS_CODES.BAD_REQUEST, "Missing stripe-signature header"));
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, // Must be the raw request body buffer
      sig,
      config.stripe.webhookSecret
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    return next(new ApiError(STATUS_CODES.BAD_REQUEST, `Webhook Signature Error: ${err.message}`));
  }
};

export default verifyStripeWebhook;
