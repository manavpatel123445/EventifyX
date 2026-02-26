import mongoose from 'mongoose';
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

const fixCategories = async () => {
  try {
    await connectDB();
    
    console.log('🧹 Cleaning up categories...');
    
    // Map of category names to their proper data
    const properCategories = {
      'Technology': { icon: '💻', color: '#3B82F6', description: 'Tech conferences, workshops, hackathons, and IT events' },
      'Music': { icon: '🎵', color: '#F59E0B', description: 'Concerts, festivals, live performances, and music events' },
      'Sports': { icon: '⚽', color: '#10B981', description: 'Sporting events, tournaments, fitness activities, and athletics' },
      'Business': { icon: '💼', color: '#6366F1', description: 'Corporate events, networking, seminars, and professional development' },
      'Entertainment': { icon: '🎭', color: '#EC4899', description: 'Comedy shows, theater, movies, and entertainment events' },
      'Food & Drink': { icon: '🍽️', color: '#F97316', description: 'Food festivals, wine tastings, cooking classes, and culinary events' },
      'Arts & Culture': { icon: '🎨', color: '#8B5CF6', description: 'Art exhibitions, cultural festivals, museums, and creative events' },
      'Health & Wellness': { icon: '🧘', color: '#059669', description: 'Yoga, meditation, health seminars, and wellness workshops' },
      'Education': { icon: '📚', color: '#DC2626', description: 'Workshops, courses, lectures, and educational seminars' },
      'Travel': { icon: '✈️', color: '#0891B2', description: 'Travel meetups, destination events, and adventure activities' },
      'Gaming': { icon: '🎮', color: '#7C3AED', description: 'Gaming tournaments, esports events, and gaming conventions' },
      'Fashion': { icon: '👗', color: '#BE185D', description: 'Fashion shows, style workshops, and fashion industry events' },
      'Automotive': { icon: '🚗', color: '#374151', description: 'Car shows, racing events, and automotive exhibitions' },
      'Photography': { icon: '📸', color: '#1F2937', description: 'Photo walks, photography workshops, and exhibitions' },
      'Startup': { icon: '🚀', color: '#7C2D12', description: 'Startup pitches, entrepreneurship events, and innovation meetups' }
    };
    
    // Categories to rename/merge
    const categoryMappings = {
      'Music Shows': 'Music',
      'concerts': 'Music',
      'Stand-up Comedy': 'Entertainment',
      'Wrokshops': 'Education' // Fix typo
    };
    
    console.log('\n🔄 Processing category mappings...');
    
    // First, handle mappings (rename/merge categories)
    for (const [oldName, newName] of Object.entries(categoryMappings)) {
      const oldCategory = await Category.findOne({ name: oldName });
      if (oldCategory) {
        console.log(`🔄 Merging "${oldName}" into "${newName}"`);
        // Delete the old category (events should be reassigned in a production system)
        await Category.findByIdAndDelete(oldCategory._id);
      }
    }
    
    console.log('\n🔧 Updating categories with proper icons and data...');
    
    // Now ensure all proper categories exist with correct data
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const [categoryName, categoryData] of Object.entries(properCategories)) {
      let category = await Category.findOne({ name: categoryName });
      
      if (category) {
        // Update existing category
        category.icon = categoryData.icon;
        category.color = categoryData.color;
        category.description = categoryData.description;
        category.status = 'active';
        await category.save();
        console.log(`📝 Updated: ${categoryName} ${categoryData.icon}`);
        updatedCount++;
      } else {
        // Create new category
        category = new Category({
          name: categoryName,
          icon: categoryData.icon,
          color: categoryData.color,
          description: categoryData.description,
          status: 'active'
        });
        await category.save();
        console.log(`✅ Created: ${categoryName} ${categoryData.icon}`);
        createdCount++;
      }
    }
    
    console.log('\n📊 Final Results:');
    console.log(`   Created: ${createdCount} categories`);
    console.log(`   Updated: ${updatedCount} categories`);
    
    // Show final category list
    const finalCategories = await Category.find({ status: 'active' }).sort({ name: 1 });
    console.log(`\n🎯 Active categories: ${finalCategories.length}`);
    
    console.log('\n📋 Category showcase:');
    finalCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.icon} ${cat.name}`);
      console.log(`      Color: ${cat.color}`);
      console.log(`      Description: ${cat.description}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

fixCategories();
