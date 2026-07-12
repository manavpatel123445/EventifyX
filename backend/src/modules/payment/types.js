/**
 * @typedef {Object} PaymentType
 * @property {string} id - Unique database payment record ID
 * @property {string} user - User ObjectId who paid (or guest null)
 * @property {string} event - Event ObjectId booked
 * @property {Array<string>} tickets - List of Ticket ObjectIds
 * @property {string} stripeSessionId - Stripe Checkout Session ID
 * @property {string} stripePaymentIntentId - Stripe Payment Intent ID
 * @property {number} amount - Amount paid
 * @property {string} currency - currency code (default: inr)
 * @property {string} status - pending, reserved, succeeded, failed, refunded, cancelled, expired
 * @property {string} receiptUrl - Stripe receipt pdf link
 */

export {};
