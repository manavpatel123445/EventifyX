import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Category from '../models/Category.js';
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

const verifySystem = async () => {
  try {
    await connectDB();
    
    console.log('🔍 SYSTEM VERIFICATION REPORT');
    console.log('=' * 50);
    
    // Check all events
    const allEvents = await Event.find({});
    console.log(`\n📊 Total events in database: ${allEvents.length}`);
    
    // Check by status
    const statusCounts = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📈 Events by status:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} events`);
    });
    
    // Check events that should show on home page
    const homePageEvents = await Event.find({
      status: 'upcoming',
      isPublic: true,
      isDeleted: false
    }).populate('category', 'name').populate('eventManager', 'name');
    
    console.log(`\n🏠 Events visible on HOME PAGE: ${homePageEvents.length}`);
    homePageEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      📅 ${new Date(event.startDate).toLocaleDateString()} in ${event.venue.city}`);
      console.log(`      💰 From $${event.ticketPricing[0]?.price || 0}`);
      console.log(`      👤 Manager: ${event.eventManager?.name || 'Unknown'}`);
      console.log('');
    });
    
    // Check API format (simulate what frontend receives)
    console.log('🌐 API RESPONSE SIMULATION:');
    console.log('='.repeat(40));
    
    const apiResponse = {
      success: true,
      data: {
        events: homePageEvents,
        pagination: {
          current: 1,
          pages: Math.ceil(homePageEvents.length / 8),
          total: homePageEvents.length
        }
      }
    };
    
    console.log('Response structure:', {
      success: apiResponse.success,
      'data.events.length': apiResponse.data.events.length,
      'data.pagination': apiResponse.data.pagination
    });
    
    // Test specific frontend access patterns
    console.log('\n🔧 Frontend Access Patterns:');
    console.log('response.success:', apiResponse.success);
    console.log('response.data.events.length:', apiResponse.data.events.length);
    console.log('First event title:', apiResponse.data.events[0]?.title || 'None');
    
    if (homePageEvents.length === 0) {
      console.log('\n⚠️  WARNING: No events will show on home page!');
      console.log('   Reasons could be:');
      console.log('   - All events have status other than "upcoming"');
      console.log('   - Events have isPublic = false');
      console.log('   - Events have isDeleted = true');
    } else {
      console.log('\n✅ SUCCESS: Home page should display events!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

verifySystem();
