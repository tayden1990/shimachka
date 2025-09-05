#!/usr/bin/env node

/**
 * Deployment Script with Automatic Webhook Setup
 * Handles the complete deployment process and webhook configuration
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment with automatic webhook setup...\n');

let workerUrl = null;

async function main() {
  try {
    // Step 1: Deploy to Cloudflare Workers
    console.log('1️⃣  Deploying to Cloudflare Workers...');
    
    const deployOutput = execSync('wrangler deploy', { 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit']
    });
    
    console.log(deployOutput);
    
    // Extract worker URL from deployment output
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+\.workers\.dev/);
    if (urlMatch) {
      workerUrl = urlMatch[0];
      console.log(`✅ Deployment successful!`);
      console.log(`📡 Worker URL: ${workerUrl}\n`);
    } else {
      console.log('⚠️  Could not extract worker URL from deployment output');
      console.log('   Using default URL...\n');
      workerUrl = 'https://leitner-telegram-bot.t-ak-sa.workers.dev';
    }
    
    // Step 2: Wait a moment for the worker to be fully ready
    console.log('2️⃣  Waiting for worker to be ready...');
    await delay(3000);
    console.log('✅ Ready to configure webhook\n');
    
    // Step 3: Setup webhook
    console.log('3️⃣  Setting up Telegram webhook...');
    
    // Check if we have the bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    
    if (!botToken) {
      console.log('⚠️  TELEGRAM_BOT_TOKEN not found in environment');
      console.log('');
      console.log('🔧 To complete the setup:');
      console.log('');
      console.log('Option 1 - Set token temporarily:');
      console.log('  export TELEGRAM_BOT_TOKEN=your_bot_token_here');
      console.log('  npm run setup-webhook');
      console.log('');
      console.log('Option 2 - Use wrangler secrets (recommended):');
      console.log('  wrangler secret put TELEGRAM_BOT_TOKEN');
      console.log('  npm run setup-webhook');
      console.log('');
      console.log('Option 3 - For production, use GitHub Actions:');
      console.log('  Set TELEGRAM_BOT_TOKEN in your GitHub repository secrets');
      console.log('  Push to main branch for automatic deployment with webhook');
      console.log('');
      console.log('✅ Deployment completed successfully!');
      console.log('⚠️  Webhook setup skipped - please configure manually');
      return;
    }
    
    // Set the worker URL as environment variable for the webhook script
    process.env.WORKER_URL = workerUrl;
    
    // Run the webhook setup script
    const webhookScript = path.join(__dirname, 'setup-webhook.js');
    execSync(`node "${webhookScript}"`, { 
      stdio: 'inherit',
      env: { ...process.env, WORKER_URL: workerUrl }
    });
    
    console.log('\n🎉 Deployment and webhook setup complete!');
    console.log('📱 Your Telegram bot is now live and ready to receive messages!');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.stdout) {
      console.log('\nOutput:', error.stdout.toString());
    }
    
    if (error.stderr) {
      console.error('\nError details:', error.stderr.toString());
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your wrangler configuration');
    console.log('2. Verify your Cloudflare credentials');
    console.log('3. Ensure TELEGRAM_BOT_TOKEN is set: wrangler secret put TELEGRAM_BOT_TOKEN');
    console.log('4. Try deploying manually: npm run deploy-only');
    
    process.exit(1);
  }
}

// Helper function for async execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the main function
main();
