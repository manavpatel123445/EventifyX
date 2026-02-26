import Event from "../models/Event.js";
import cron from 'node-cron';

// Function to update event statuses based on current date/time
export const updateEventStatuses = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Update events to 'ongoing' if they have started
    const eventsToMarkOngoing = await Event.find({
      status: 'upcoming',
      startDate: { $lte: now },
      isDeleted: false
    });
    
    for (const event of eventsToMarkOngoing) {
      // Check if current time is after start time for events starting today
      const eventStartDate = new Date(event.startDate);
      const isToday = eventStartDate.toDateString() === now.toDateString();
      
      if (!isToday || currentTime >= event.startTime) {
        event.status = 'ongoing';
        await event.save();
        console.log(`Event "${event.title}" marked as ongoing`);
      }
    }
    
    // Update events to 'completed' if they have ended
    const eventsToMarkCompleted = await Event.find({
      status: { $in: ['upcoming', 'ongoing'] },
      endDate: { $lt: now },
      isDeleted: false
    });
    
    for (const event of eventsToMarkCompleted) {
      // Check if current time is after end time for events ending today
      const eventEndDate = new Date(event.endDate);
      const isToday = eventEndDate.toDateString() === now.toDateString();
      
      if (!isToday || currentTime >= event.endTime) {
        event.status = 'completed';
        await event.save();
        console.log(`Event "${event.title}" marked as completed`);
      }
    }
    
    console.log(`Event status update completed at ${now}`);
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
};

// Function to auto soft delete old completed events (30 days after completion)
export const autoSoftDeleteOldCompletedEvents = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const eventsToDelete = await Event.find({
      status: 'completed',
      endDate: { $lt: thirtyDaysAgo },
      isDeleted: false
    });
    
    let deletedCount = 0;
    for (const event of eventsToDelete) {
      event.isDeleted = true;
      await event.save();
      deletedCount++;
      console.log(`Auto soft deleted completed event: "${event.title}"`);
    }
    
    if (deletedCount > 0) {
      console.log(`Auto soft deleted ${deletedCount} old completed events`);
    }
  } catch (error) {
    console.error('Error auto soft deleting completed events:', error);
  }
};

// Start scheduled jobs
export const startEventScheduler = () => {
  // Run every 30 minutes to update event statuses
  cron.schedule('*/30 * * * *', () => {
    console.log('Running scheduled event status update...');
    updateEventStatuses();
  });
  
  // Run daily at 2 AM to clean up old completed events
  cron.schedule('0 2 * * *', () => {
    console.log('Running scheduled cleanup of old completed events...');
    autoSoftDeleteOldCompletedEvents();
  });
  
  console.log('Event scheduler started successfully');
};

// Export individual functions for manual triggers
export { updateEventStatuses as manualUpdateEventStatuses };
export { autoSoftDeleteOldCompletedEvents as manualAutoSoftDeleteOldCompletedEvents };
