/**
 * @typedef {Object} TicketType
 * @property {string} id - Unique Ticket ID
 * @property {string} user - User ObjectId who owns this ticket (null if guest)
 * @property {string} event - Event ObjectId
 * @property {string} payment - Payment ObjectId associated
 * @property {string} ticketType - Tier: early_bird, regular, vip, premium
 * @property {number} price - Ticket tier purchase price
 * @property {string} status - active, used, cancelled, refunded
 * @property {string} qrCodeUrl - base64 data URL for scanning
 * @property {string} [seatNumber] - Seat assignment
 */

export {};
