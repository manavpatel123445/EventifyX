import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EVENT_COUNT = 20;

const categorySeeds = [
  { 
    name: "Technology", 
    description: "Tech talks and innovation events", 
    icon: "💻", 
    color: "#2563EB",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    ]
  },
  { 
    name: "Music", 
    description: "Live gigs and musical experiences", 
    icon: "🎵", 
    color: "#7C3AED",
    images: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      "https://images.unsplash.com/photo-1459749411177-042180ce673c"
    ]
  },
  { 
    name: "Business", 
    description: "Startup, leadership, and networking events", 
    icon: "💼", 
    color: "#0F766E",
    images: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
      "https://images.unsplash.com/photo-1552664730-d307ca884978"
    ]
  },
  { 
    name: "Arts", 
    description: "Creative arts and cultural showcases", 
    icon: "🎨", 
    color: "#DB2777",
    images: [
      "https://images.unsplash.com/photo-1460666819251-ebf94a577162",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8"
    ]
  },
];

const cities = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Delhi", state: "Delhi" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Ahmedabad", state: "Gujarat" },
];

const titlePrefixes = [
  "Future",
  "Global",
  "NextGen",
  "Premium",
  "Innovation",
  "Creator",
  "Impact",
  "Urban",
  "Spark",
  "Summit",
];

const titleThemes = [
  "Tech Expo",
  "Design Meetup",
  "Startup Connect",
  "Music Night",
  "AI Workshop",
  "Business Forum",
  "Community Fest",
  "Leadership Talk",
  "Product Bootcamp",
  "Creative Jam",
];

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");
}

async function ensureCategories() {
  const categories = [];

  for (const seed of categorySeeds) {
    const category = await Category.findOneAndUpdate(
      { name: seed.name },
      { $setOnInsert: { name: seed.name, description: seed.description, icon: seed.icon, color: seed.color }, $set: { status: "active" } },
      { new: true, upsert: true }
    );
    categories.push({ ...category.toObject(), seedImages: seed.images });
  }

  return categories;
}

async function ensureManagerUser() {
  let user = await User.findOne({ role: { $in: ["admin", "event_manager"] } });

  if (!user) {
    user = await User.create({
      name: "seed_event_manager",
      email: "seed.manager@eventifyx.com",
      password: "EventifyX@12345",
      role: "event_manager",
      status: "active",
    });
    console.log("✅ Created seed event manager user");
  }

  return user;
}

function getEventTitle(index) {
  const prefix = titlePrefixes[index % titlePrefixes.length];
  const theme = titleThemes[index % titleThemes.length];
  return `${prefix} ${theme} ${new Date().getFullYear()} #${index + 1}`;
}

function getStartAndEndDate(index) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + index + 1);
  startDate.setHours(18 + (index % 3), 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 3, 0, 0, 0);

  return { startDate, endDate };
}

async function createTwentyEvents() {
  await connectDB();

  const categories = await ensureCategories();
  const manager = await ensureManagerUser();

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < EVENT_COUNT; i += 1) {
    const title = getEventTitle(i);
    const existing = await Event.findOne({ title });

    const { startDate, endDate } = getStartAndEndDate(i);
    const location = cities[i % cities.length];
    const category = categories[i % categories.length];
    const regularPrice = 499 + i * 40;

    if (existing) {
      existing.images = [
        category.seedImages[i % category.seedImages.length] + "?auto=format&fit=crop&q=80&w=1200"
      ];
      await existing.save();
      skipped += 1;
      continue;
    }

    await Event.create({
      title,
      description: `Join ${title} for curated sessions, networking, and practical insights for attendees and organizers.`,
      category: category._id,
      startDate,
      endDate,
      startTime: `${String(startDate.getHours()).padStart(2, "0")}:00`,
      endTime: `${String(endDate.getHours()).padStart(2, "0")}:00`,
      venue: {
        name: `${location.city} Convention Center`,
        address: `${100 + i} Event Plaza`,
        city: location.city,
        state: location.state,
      },
      ticketPricing: [
        { type: "regular", price: regularPrice, quantity: 300 },
        { type: "vip", price: regularPrice + 700, quantity: 120 },
      ],
      images: [
        category.seedImages[i % category.seedImages.length] + "?auto=format&fit=crop&q=80&w=1200"
      ],
      eventManager: manager._id,
      status: "upcoming",
      isPublic: true,
      isDeleted: false,
      approvedBy: manager._id,
      tags: ["conference", "networking", "community"],
    });

    created += 1;
  }

  const publicUpcomingCount = await Event.countDocuments({
    status: "upcoming",
    isPublic: true,
    isDeleted: false,
  });

  console.log(`✅ Events created: ${created}`);
  console.log(`⏭️ Events skipped (already existed): ${skipped}`);
  console.log(`📊 Total upcoming public events: ${publicUpcomingCount}`);
}

createTwentyEvents()
  .catch((error) => {
    console.error("❌ Failed to seed events:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  });
