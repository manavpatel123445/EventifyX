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

const createMoreEvents = async () => {
  try {
    await connectDB();
    
    // Get existing category and user
    const category = await Category.findOne();
    const user = await User.findOne({ role: { $in: ['admin', 'event_manager'] } });
    
    if (!category || !user) {
      console.log('❌ Need category and user to create events');
      return;
    }
    
    const eventsToCreate = [
      {
        title: 'Web Development Bootcamp',
        description: 'Learn modern web development with React, Node.js, and MongoDB in this intensive bootcamp.',
        city: 'New York',
        state: 'New York',
        daysFromNow: 3,
        price: 75
      },
      {
        title: 'AI & Machine Learning Summit',
        description: 'Explore the latest trends in artificial intelligence and machine learning.',
        city: 'Seattle', 
        state: 'Washington',
        daysFromNow: 5,
        price: 120
      },
      {
        title: 'Digital Marketing Conference',
        description: 'Master the art of digital marketing and social media strategies.',
        city: 'Austin',
        state: 'Texas', 
        daysFromNow: 7,
        price: 60
      },
      {
        title: 'Startup Pitch Night',
        description: 'Watch innovative startups pitch their ideas to investors.',
        city: 'Los Angeles',
        state: 'California',
        daysFromNow: 10,
        price: 25
      }
    ];
    
    for (const eventData of eventsToCreate) {
      const existing = await Event.findOne({ title: eventData.title });
      if (existing) {
        console.log(`⏭️  Event "${eventData.title}" already exists, skipping...`);
        continue;
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + eventData.daysFromNow);
      startDate.setHours(19, 0, 0, 0); // 7 PM
      
      const endDate = new Date(startDate);
      endDate.setHours(21, 0, 0, 0); // 9 PM
      
      const event = new Event({
        title: eventData.title,
        description: eventData.description,
        category: category._id,
        startDate: startDate,
        endDate: endDate,
        startTime: '19:00',
        endTime: '21:00',
        venue: {
          name: `${eventData.city} Convention Center`,
          address: `123 Main Street`,
          city: eventData.city,
          state: eventData.state
        },
        ticketPricing: [
          {
            type: 'regular',
            price: eventData.price,
            quantity: 150
          },
          {
            type: 'vip',
            price: eventData.price * 2,
            quantity: 50
          }
        ],
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87.jpg'],
        eventManager: user._id,
        status: 'upcoming',
        isPublic: true,
        isDeleted: false,
        approvedBy: user._id,
        tags: ['technology', 'conference', 'networking']
      });
      
      await event.save();
      console.log(`✅ Created: ${event.title} on ${startDate.toLocaleDateString()} in ${eventData.city}`);
    }
    
    // Show final count
    const upcomingCount = await Event.countDocuments({ status: 'upcoming', isPublic: true, isDeleted: false });
    console.log(`\n📊 Total upcoming events available: ${upcomingCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

createMoreEvents();
