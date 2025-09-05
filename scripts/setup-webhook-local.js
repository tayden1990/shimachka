#!/usr/bin/env node

/**
 * Local Webhook Setup Script
 * For setting up webhook when developing locally
 */

console.log('🔧 Local Webhook Setup for Development\n');

console.log('📋 To set up the webhook for your local development:');
console.log('');
console.log('1️⃣  First, set your Telegram bot token as a secret:');
console.log('   wrangler secret put TELEGRAM_BOT_TOKEN');
console.log('');
console.log('2️⃣  Then, export it temporarily for local setup:');
console.log('   export TELEGRAM_BOT_TOKEN=your_bot_token_here');
console.log('   # or on Windows:');
console.log('   set TELEGRAM_BOT_TOKEN=your_bot_token_here');
console.log('');
console.log('3️⃣  Run the webhook setup:');
console.log('   npm run setup-webhook');
console.log('');
console.log('🚀 For automatic deployment with webhook setup:');
console.log('   npm run deploy');
console.log('');
console.log('💡 Note: In production (GitHub Actions), the webhook is automatically');
console.log('   configured using the secrets you set in your repository settings.');
console.log('');

// Check if token is available
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (botToken) {
  console.log('✅ TELEGRAM_BOT_TOKEN found in environment');
  console.log('🔄 Running webhook setup...\n');
  
  // Run the actual webhook setup
  const { spawn } = require('child_process');
  const path = require('path');
  
  const setupScript = path.join(__dirname, 'setup-webhook.js');
  const child = spawn('node', [setupScript], { 
    stdio: 'inherit',
    env: process.env 
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 Webhook setup completed successfully!');
    } else {
      console.log('\n❌ Webhook setup failed');
      process.exit(code);
    }
  });
  
} else {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
  console.log('   Please follow the steps above to set it up.');
}
