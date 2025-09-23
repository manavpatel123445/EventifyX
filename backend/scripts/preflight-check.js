#!/usr/bin/env node

/**
 * Render.com Deployment Pre-flight Check
 * Run this before deploying to catch common issues
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Render.com Deployment Pre-flight Check\n');

// Check 1: Package.json exists and is valid
try {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error('package.json not found in backend root');
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  console.log('✅ package.json found and valid');

  // Check required scripts
  if (!packageJson.scripts?.start) {
    throw new Error('Missing start script in package.json');
  }
  console.log('✅ Start script found:', packageJson.scripts.start);

  if (!packageJson.scripts?.build) {
    console.log('⚠️  No build script found (this is OK for Node.js backends)');
  } else {
    console.log('✅ Build script found:', packageJson.scripts.build);
  }

} catch (error) {
  console.log('❌ Package.json check failed:', error.message);
  process.exit(1);
}

// Check 2: Render.yaml exists and is valid
try {
  const renderYamlPath = join(__dirname, '..', 'render.yaml');
  if (!existsSync(renderYamlPath)) {
    throw new Error('render.yaml not found in backend root');
  }
  console.log('✅ render.yaml found');

  const renderYaml = readFileSync(renderYamlPath, 'utf8');
  if (!renderYaml.includes('buildCommand: npm install')) {
    console.log('⚠️  render.yaml might need updating');
  } else {
    console.log('✅ render.yaml has correct build command');
  }

} catch (error) {
  console.log('❌ Render.yaml check failed:', error.message);
}

// Check 3: Environment variables template
const envExamplePath = join(__dirname, '..', '.env.example');
if (existsSync(envExamplePath)) {
  console.log('✅ .env.example found');
} else {
  console.log('⚠️  No .env.example found');
}

// Check 4: Required directories exist
const requiredDirs = ['utils', 'models', 'routers', 'controllers'];
let dirsOk = true;

requiredDirs.forEach(dir => {
  if (existsSync(join(__dirname, '..', dir))) {
    console.log(`✅ ${dir}/ directory exists`);
  } else {
    console.log(`❌ ${dir}/ directory missing`);
    dirsOk = false;
  }
});

if (!dirsOk) {
  console.log('❌ Some required directories are missing');
  process.exit(1);
}

// Check 5: Main entry file exists
const mainFile = join(__dirname, '..', 'utils', 'server.js');
if (existsSync(mainFile)) {
  console.log('✅ Main server file exists: utils/server.js');
} else {
  console.log('❌ Main server file missing: utils/server.js');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 Pre-flight check completed!');
console.log('✅ Your backend appears to be ready for Render.com deployment');
console.log('\n📋 Next steps:');
console.log('1. Set up MongoDB Atlas, Stripe, and Cloudinary accounts');
console.log('2. Generate secure environment variables');
console.log('3. Deploy manually on Render.com dashboard');
console.log('4. Monitor the deployment logs');

console.log('\n🚀 Good luck with your deployment!');
