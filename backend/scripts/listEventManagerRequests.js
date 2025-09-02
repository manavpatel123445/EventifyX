import mongoose from 'mongoose';
import EventManagerRequest from '../models/EventManagerRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventifyx';

async function main() {
  await mongoose.connect(MONGO_URI);
  const requests = await EventManagerRequest.find();
  console.log(`Total requests: ${requests.length}`);
  requests.forEach(r => {
    console.log(`Status: ${r.status}, User: ${r.user}, Reason: ${r.reason}`);
  });
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error listing requests:', err);
  process.exit(1);
});