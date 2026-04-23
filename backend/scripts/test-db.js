import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URL = process.env.MONGODB_URL;

async function testConnection() {
  console.log('🔍 MongoDB Connection Diagnostic Tool');
  console.log('------------------------------------');
  
  if (!MONGODB_URL) {
    console.error('❌ MONGODB_URL is not defined in .env');
    process.exit(1);
  }

  console.log('📡 URI found in .env. Attempting connection...');
  
  const start = Date.now();
  try {
    const conn = await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    
    const duration = Date.now() - start;
    console.log(`✅ SUCCESS! Connected in ${duration}ms`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`❌ FAILED after ${duration}ms`);
    console.log('\n--- DIAGNOSIS ---');
    
    if (err.message.includes('whitelist')) {
      console.error('🚩 ISSUE: IP Whitelisting');
      console.error('Your current IP address is not allowed to access this cluster.');
      console.error('\nSteps to fix:');
      console.error('1. Go to https://cloud.mongodb.com');
      console.error('2. Navigate to "Network Access" on the left sidebar');
      console.error('3. Click "+ Add IP Address"');
      console.error('4. Choose "ALLOW ACCESS FROM ANYWHERE" (for testing) or "ADD CURRENT IP ADDRESS"');
      console.error('5. Wait 1-2 minutes for the changes to deploy.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('🚩 ISSUE: Credentials');
      console.error('The username or password in your MONGODB_URL is incorrect.');
    } else if (err.name === 'MongooseServerSelectionError') {
      console.error('🚩 ISSUE: Network/DNS');
      console.error('Could not reach the MongoDB server. Check your internet connection or if the cluster is paused.');
    } else {
      console.error(`🚩 ISSUE: Unknown error (${err.name})`);
      console.error(err.message);
    }
    
    process.exit(1);
  }
}

testConnection();
