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

const addCategories = async () => {
  try {
    await connectDB();
    
    // Check existing categories
    const existingCategories = await Category.find({});
    console.log('📊 Existing categories:', existingCategories.length);
    existingCategories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description || 'No description'}`);
    });
    
    // Define comprehensive categories with icons and descriptions
    const categoriesToAdd = [
      {
        name: 'Technology',
        description: 'Tech conferences, workshops, hackathons, and IT events',
        icon: '💻',
        color: '#3B82F6' // Blue
      },
      {
        name: 'Music',
        description: 'Concerts, festivals, live performances, and music events',
        icon: '🎵',
        color: '#F59E0B' // Amber
      },
      {
        name: 'Sports',
        description: 'Sporting events, tournaments, fitness activities, and athletics',
        icon: '⚽',
        color: '#10B981' // Emerald
      },
      {
        name: 'Business',
        description: 'Corporate events, networking, seminars, and professional development',
        icon: '💼',
        color: '#6366F1' // Indigo
      },
      {
        name: 'Entertainment',
        description: 'Comedy shows, theater, movies, and entertainment events',
        icon: '🎭',
        color: '#EC4899' // Pink
      },
      {
        name: 'Food & Drink',
        description: 'Food festivals, wine tastings, cooking classes, and culinary events',
        icon: '🍽️',
        color: '#F97316' // Orange
      },
      {
        name: 'Arts & Culture',
        description: 'Art exhibitions, cultural festivals, museums, and creative events',
        icon: '🎨',
        color: '#8B5CF6' // Violet
      },
      {
        name: 'Health & Wellness',
        description: 'Yoga, meditation, health seminars, and wellness workshops',
        icon: '🧘',
        color: '#059669' // Green
      },
      {
        name: 'Education',
        description: 'Workshops, courses, lectures, and educational seminars',
        icon: '📚',
        color: '#DC2626' // Red
      },
      {
        name: 'Travel',
        description: 'Travel meetups, destination events, and adventure activities',
        icon: '✈️',
        color: '#0891B2' // Cyan
      },
      {
        name: 'Gaming',
        description: 'Gaming tournaments, esports events, and gaming conventions',
        icon: '🎮',
        color: '#7C3AED' // Purple
      },
      {
        name: 'Fashion',
        description: 'Fashion shows, style workshops, and fashion industry events',
        icon: '👗',
        color: '#BE185D' // Rose
      },
      {
        name: 'Automotive',
        description: 'Car shows, racing events, and automotive exhibitions',
        icon: '🚗',
        color: '#374151' // Gray
      },
      {
        name: 'Photography',
        description: 'Photo walks, photography workshops, and exhibitions',
        icon: '📸',
        color: '#1F2937' // Dark Gray
      },
      {
        name: 'Startup',
        description: 'Startup pitches, entrepreneurship events, and innovation meetups',
        icon: '🚀',
        color: '#7C2D12' // Brown
      }
    ];
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const categoryData of categoriesToAdd) {
      const existing = await Category.findOne({ name: categoryData.name });
      
      if (existing) {
        // Update existing category with new fields if they don't exist
        let needsUpdate = false;
        if (!existing.icon && categoryData.icon) {
          existing.icon = categoryData.icon;
          needsUpdate = true;
        }
        if (!existing.color && categoryData.color) {
          existing.color = categoryData.color;
          needsUpdate = true;
        }
        if (!existing.description && categoryData.description) {
          existing.description = categoryData.description;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await existing.save();
          console.log(`📝 Updated: ${categoryData.name} with icon ${categoryData.icon}`);
          updatedCount++;
        } else {
          console.log(`⏭️  Skipped: ${categoryData.name} (already complete)`);
        }
      } else {
        // Create new category
        const newCategory = new Category(categoryData);
        await newCategory.save();
        console.log(`✅ Added: ${categoryData.name} ${categoryData.icon}`);
        addedCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`   Added: ${addedCount} new categories`);
    console.log(`   Updated: ${updatedCount} existing categories`);
    
    // Show final list
    const finalCategories = await Category.find({}).sort({ name: 1 });
    console.log(`\n🎯 Total categories now: ${finalCategories.length}`);
    
    console.log('\n📋 All categories:');
    finalCategories.forEach((cat, index) => {
      const icon = cat.icon || '📁';
      const color = cat.color || '#6B7280';
      console.log(`   ${index + 1}. ${icon} ${cat.name} (${color})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

addCategories();
