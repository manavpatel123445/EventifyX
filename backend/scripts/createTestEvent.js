import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const createTestEvent = async () => {
  try {
    await connectDB();
    
    // First, check if we have a category
    let category = await Category.findOne();
    if (!category) {
      category = new Category({
        name: 'Technology',
        description: 'Technology events and conferences'
      });
      await category.save();
      console.log('✅ Created test category:', category.name);
    }
    
    // Check if we have a user (admin/event manager)
    let user = await User.findOne({ role: { $in: ['admin', 'event_manager'] } });
    if (!user) {
      user = new User({
        name: 'Test Event Manager',
        email: 'test@eventifyx.com',
        password: 'hashedpassword123', // This would be properly hashed in real app
        role: 'event_manager',
        isVerified: true
      });
      await user.save();
      console.log('✅ Created test user:', user.name);
    }
    
    // Create a test event
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(20, 0, 0, 0); // 8 PM day after tomorrow
    
    const existingEvent = await Event.findOne({ title: 'Test Tech Conference 2024' });
    if (existingEvent) {
      console.log('✅ Test event already exists');
      return;
    }
    
    const testEvent = new Event({
      title: 'Test Tech Conference 2024',
      description: 'Join us for an amazing technology conference featuring the latest innovations in AI, Web Development, and Cloud Computing. This is a test event to verify the EventifyX platform is working correctly.',
      category: category._id,
      startDate: tomorrow,
      endDate: dayAfterTomorrow,
      startTime: '18:00',
      endTime: '20:00',
      venue: {
        name: 'Tech Center Convention Hall',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'California'
      },
      ticketPricing: [
        {
          type: 'regular',
          price: 50,
          quantity: 100
        },
        {
          type: 'vip',
          price: 150,
          quantity: 25
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87.jpg'
      ],
      eventManager: user._id,
      status: 'upcoming',
      isPublic: true,
      isDeleted: false,
      approvedBy: user._id,
      tags: ['technology', 'conference', 'ai', 'web development', 'test']
    });
    
    await testEvent.save();
    console.log('✅ Created test event:', testEvent.title);
    console.log('📅 Event date:', testEvent.startDate);
    console.log('📍 Event location:', testEvent.venue.city);
    console.log('🎫 Tickets available:', testEvent.ticketPricing.length, 'types');
    
    // Verify the event was created
    const events = await Event.find({}).populate('category', 'name');
    console.log('\n📊 Total events in database:', events.length);
    events.forEach(event => {
      console.log(`- ${event.title} (${event.status}) in ${event.venue.city}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test event:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

createTestEvent();
