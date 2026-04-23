import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/eventifyx";

async function checkRequest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const EventRequest = (await import('../models/EventRequest.js')).default;
    const Event = (await import('../models/Event.js')).default;
    const User = (await import('../models/User.js')).default;

    const requestId = "69e86731b1814ca87144faa4";
    const eventRequest = await EventRequest.findById(requestId);

    if (!eventRequest) {
      console.log("Request not found");
      process.exit(0);
    }
    
    console.log("Found request, attempting to simulate approval...");

    const venue = { ...eventRequest.venue };
    if (!venue.capacity || venue.capacity <= 0) {
      venue.capacity = eventRequest.ticketPricing.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 1;
    }

    const approvedEvent = new Event({
      title: eventRequest.title,
      description: eventRequest.description,
      category: eventRequest.category,
      startDate: eventRequest.startDate,
      endDate: eventRequest.endDate,
      startTime: eventRequest.startTime,
      endTime: eventRequest.endTime,
      venue: venue,
      ticketPricing: eventRequest.ticketPricing,
      images: eventRequest.images,
      eventManager: eventRequest.requestedBy,
      originalRequest: eventRequest._id,
      approvedBy: eventRequest.requestedBy, // Dummy
      tags: eventRequest.tags || []
    });

    console.log("Validating approvedEvent...");
    const eventError = approvedEvent.validateSync();
    if (eventError) {
      console.log("Event Validation Error:", eventError.message);
      console.log(JSON.stringify(eventError.errors, null, 2));
    } else {
      console.log("Event validation passed!");
    }

    const user = await User.findById(eventRequest.requestedBy);
    if (user) {
      if (user.role === "user") {
        user.role = "event_manager";
        user.becameManagerAt = new Date();
      }
      if (!user.managedEvents.some(id => id.toString() === approvedEvent._id.toString())) {
        user.managedEvents.push(approvedEvent._id);
      }
      console.log("Validating User...");
      const userError = user.validateSync();
      if (userError) {
        console.log("User Validation Error:", userError.message);
        console.log(JSON.stringify(userError.errors, null, 2));
      } else {
        console.log("User validation passed!");
      }
    } else {
      console.log("User not found!");
    }

    eventRequest.status = "approved";
    eventRequest.adminNotes = "Simulated approval";
    eventRequest.reviewedBy = eventRequest.requestedBy;

    console.log("Validating EventRequest...");
    const reqError = eventRequest.validateSync();
    if (reqError) {
      console.log("EventRequest Validation Error:", reqError.message);
      console.log(JSON.stringify(reqError.errors, null, 2));
    } else {
      console.log("EventRequest validation passed!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkRequest();
