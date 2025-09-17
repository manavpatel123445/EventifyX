import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const checkAndUpdateEventStatuses = async () => {
  try {
    await connectDB();
    
    const now = new Date();
    console.log('\n🕒 Current date/time:', now.toISOString());
    console.log('🕒 Local time:', now.toLocaleString());
    
    // Get all events
    const events = await Event.find({}).populate('category', 'name');
    
    console.log('\n📊 Found', events.length, 'total events:');
    console.log('='.repeat(80));
    
    for (const event of events) {
      console.log(`\n📍 Event: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start: ${event.startDate.toISOString()} (${event.startDate.toLocaleString()})`);
      console.log(`   End: ${event.endDate.toISOString()} (${event.endDate.toLocaleString()})`);
      console.log(`   Start Time: ${event.startTime}`);
      console.log(`   End Time: ${event.endTime}`);
      console.log(`   isPublic: ${event.isPublic}`);
      console.log(`   isDeleted: ${event.isDeleted}`);
      
      let newStatus = event.status;
      
      // Check if event should be completed
      if (event.endDate < now) {
        newStatus = 'completed';
      }
      // Check if event should be ongoing
      else if (event.startDate <= now && event.endDate >= now) {
        newStatus = 'ongoing';
      }
      // Otherwise it's upcoming (if start date is in future)
      else if (event.startDate > now) {
        newStatus = 'upcoming';
      }
      
      if (newStatus !== event.status) {
        console.log(`   ⬆️  Updating status: ${event.status} → ${newStatus}`);
        event.status = newStatus;
        await event.save();
      } else {
        console.log(`   ✅ Status is correct: ${event.status}`);
      }
    }
    
    // Now show summary by status
    console.log('\n📈 Summary by status:');
    console.log('='.repeat(40));
    
    const statusCounts = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          events: { $push: { title: '$title', startDate: '$startDate' } }
        }
      }
    ]);
    
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count} events`);
      status.events.forEach(event => {
        console.log(`  - ${event.title} (${new Date(event.startDate).toLocaleDateString()})`);
      });
    });
    
    // Show events that should be visible on home page
    console.log('\n🏠 Events that should show on HOME PAGE:');
    console.log('='.repeat(50));
    
    const visibleEvents = await Event.find({ 
      status: 'upcoming', 
      isPublic: true, 
      isDeleted: false 
    }).populate('category', 'name');
    
    console.log(`Found ${visibleEvents.length} upcoming, public, non-deleted events:`);
    visibleEvents.forEach(event => {
      console.log(`  ✅ ${event.title} - ${event.venue.city} (${new Date(event.startDate).toLocaleDateString()})`);
    });
    
    if (visibleEvents.length === 0) {
      console.log('❌ No events match the home page criteria!');
      console.log('   Creating a new upcoming event for testing...');
      
      // Create a future event that will definitely show
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      dayAfter.setHours(20, 0, 0, 0);
      
      // Get a category and user
      const category = await Event.findOne().populate('category');
      const eventManager = await Event.findOne().populate('eventManager');
      
      if (category && eventManager) {
        const newEvent = new Event({
          title: 'Future Tech Conference 2024',
          description: 'A guaranteed upcoming event that should appear on the home page.',
          category: category.category._id,
          startDate: tomorrow,
          endDate: dayAfter,
          startTime: '18:00',
          endTime: '20:00',
          venue: {
            name: 'Future Tech Center',
            address: '123 Tomorrow Street',
            city: 'Future City',
            state: 'Tomorrow State'
          },
          ticketPricing: [
            {
              type: 'regular',
              price: 25,
              quantity: 200
            }
          ],
          images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87.jpg'],
          eventManager: eventManager.eventManager._id,
          status: 'upcoming',
          isPublic: true,
          isDeleted: false,
          approvedBy: eventManager.eventManager._id,
          tags: ['future', 'tech', 'guaranteed']
        });
        
        await newEvent.save();
        console.log('✅ Created future event:', newEvent.title);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkAndUpdateEventStatuses();
