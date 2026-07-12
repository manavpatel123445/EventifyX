/**
 * @typedef {Object} EventType
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Title of the event
 * @property {string} description - Long description of the event
 * @property {string} category - Category ObjectId
 * @property {Date} startDate - Event start date
 * @property {Date} endDate - Event end date
 * @property {string} startTime - HH:MM start time
 * @property {string} endTime - HH:MM end time
 * @property {Object} venue - Venue details
 * @property {string} venue.name - Venue name
 * @property {string} venue.address - Venue physical address
 * @property {string} venue.city - Venue city
 * @property {string} venue.state - Venue state
 * @property {number} venue.capacity - Max venue capacity
 * @property {Array<Object>} ticketPricing - Pricing tiers
 * @property {string} status - Event status: upcoming, ongoing, completed, cancelled
 * @property {string} eventManager - Manager User ObjectId
 * @property {string} slug - Unique url slug
 */

export {};
