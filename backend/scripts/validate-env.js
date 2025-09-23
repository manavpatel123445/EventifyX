#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Run this before deploying to check if all required variables are set
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const requiredVars = [
  'MONGODB_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const optionalVars = [
  'NODE_ENV',
  'CLIENT_URL',
  'PORT'
];

console.log('🔍 Checking Environment Variables...\n');

// Check required variables
let allRequiredSet = true;
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = value && value.trim().length > 0;

  if (isSet) {
    // Show first/last few characters for sensitive data
    const displayValue = varName.includes('SECRET') || varName.includes('KEY')
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value.substring(0, 30) + (value.length > 30 ? '...' : '');

    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allRequiredSet = false;
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = value && value.trim().length > 0;

  if (isSet) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (using defaults)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allRequiredSet) {
  console.log('🎉 All required environment variables are set!');
  console.log('✅ Your configuration looks good for deployment.');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('⚠️  Please set all required variables before deploying.');
  process.exit(1);
}

console.log('\n📝 Next Steps:');
console.log('1. Copy your environment variables to Render.com dashboard');
console.log('2. Set CLIENT_URL to your frontend domain');
console.log('3. Ensure MongoDB Atlas allows connections from 0.0.0.0/0');
console.log('4. Deploy to Render.com');

console.log('\n🚀 Ready to deploy!');
