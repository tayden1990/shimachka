#!/usr/bin/env node

/**
 * Telegram Webhook Setup Script
 * Automatically configures the webhook after deployment
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const WEBHOOK_PATH = '/webhook';
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Get environment variables from wrangler secrets
 */
function getConfig() {
  try {
    // Try to get the worker URL from wrangler deployment output
    const workerUrl = process.env.WORKER_URL || 'https://leitner-telegram-bot.t-ak-sa.workers.dev';
    
    // Try multiple sources for the bot token
    let botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    
    // If running in GitHub Actions, token should be available
    if (process.env.GITHUB_ACTIONS) {
      console.log('🔄 Running in GitHub Actions environment');
      if (!botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in GitHub Actions environment');
        console.log('💡 Make sure the secret is set in your GitHub repository settings');
        process.exit(1);
      }
    } else {
      // Running locally - try to get from wrangler secrets
      if (!botToken) {
        console.log('🔄 Running locally - checking wrangler secrets...');
        try {
          const { execSync } = require('child_process');
          // Try to get the secret value (this might not work in all cases)
          console.log('💡 TELEGRAM_BOT_TOKEN not found in environment variables');
          console.log('   Please set it with: wrangler secret put TELEGRAM_BOT_TOKEN');
          console.log('   Or export it temporarily: export TELEGRAM_BOT_TOKEN=your_token_here');
          console.log('   Then run: npm run setup-webhook');
          process.exit(1);
        } catch (error) {
          console.error('❌ Could not access wrangler secrets');
          console.log('💡 Please set TELEGRAM_BOT_TOKEN environment variable or use wrangler secret put');
          process.exit(1);
        }
      }
    }
    
    return {
      workerUrl: workerUrl.replace(/\/$/, ''), // Remove trailing slash
      botToken,
      webhookUrl: `${workerUrl.replace(/\/$/, '')}${WEBHOOK_PATH}`
    };
  } catch (error) {
    console.error('❌ Error getting configuration:', error.message);
    process.exit(1);
  }
}

/**
 * Make HTTPS request
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Leitner-Bot-Webhook-Setup/1.0'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Get current webhook info
 */
async function getWebhookInfo(botToken) {
  const url = `${TELEGRAM_API_BASE}${botToken}/getWebhookInfo`;
  try {
    const response = await makeRequest(url);
    return response;
  } catch (error) {
    throw new Error(`Failed to get webhook info: ${error.message}`);
  }
}

/**
 * Set webhook URL
 */
async function setWebhook(botToken, webhookUrl) {
  const url = `${TELEGRAM_API_BASE}${botToken}/setWebhook`;
  const data = {
    url: webhookUrl,
    allowed_updates: [
      'message',
      'callback_query',
      'inline_query',
      'chosen_inline_result'
    ],
    drop_pending_updates: false,
    secret_token: undefined // Optional: add secret token for security
  };
  
  try {
    const response = await makeRequest(url, 'POST', data);
    return response;
  } catch (error) {
    throw new Error(`Failed to set webhook: ${error.message}`);
  }
}

/**
 * Delete webhook (for cleanup)
 */
async function deleteWebhook(botToken) {
  const url = `${TELEGRAM_API_BASE}${botToken}/deleteWebhook`;
  const data = { drop_pending_updates: false };
  
  try {
    const response = await makeRequest(url, 'POST', data);
    return response;
  } catch (error) {
    throw new Error(`Failed to delete webhook: ${error.message}`);
  }
}

/**
 * Test the webhook endpoint
 */
async function testWebhookEndpoint(webhookUrl) {
  try {
    const healthUrl = webhookUrl.replace('/webhook', '/health');
    const response = await makeRequest(healthUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Main setup function
 */
async function setupWebhook() {
  console.log('🚀 Setting up Telegram webhook...\n');
  
  const config = getConfig();
  
  console.log(`📡 Worker URL: ${config.workerUrl}`);
  console.log(`🔗 Webhook URL: ${config.webhookUrl}`);
  console.log(`🤖 Bot Token: ${config.botToken.substring(0, 10)}...\n`);
  
  try {
    // Step 1: Test if the worker is accessible
    console.log('1️⃣  Testing worker endpoint...');
    const isEndpointAccessible = await testWebhookEndpoint(config.webhookUrl);
    if (!isEndpointAccessible) {
      console.log('⚠️  Warning: Worker endpoint may not be fully ready yet');
      console.log('   This is normal for fresh deployments. Continuing...\n');
    } else {
      console.log('✅ Worker endpoint is accessible\n');
    }
    
    // Step 2: Get current webhook info
    console.log('2️⃣  Getting current webhook information...');
    const currentWebhook = await getWebhookInfo(config.botToken);
    
    if (currentWebhook.status === 200 && currentWebhook.data.ok) {
      const webhookInfo = currentWebhook.data.result;
      console.log(`   Current webhook URL: ${webhookInfo.url || 'None'}`);
      console.log(`   Pending updates: ${webhookInfo.pending_update_count || 0}`);
      console.log(`   Last error: ${webhookInfo.last_error_message || 'None'}\n`);
      
      // If webhook is already set to the correct URL, we're done
      if (webhookInfo.url === config.webhookUrl) {
        console.log('✅ Webhook is already configured correctly!');
        console.log('🎉 Setup complete!\n');
        return;
      }
    } else {
      console.log('⚠️  Could not get current webhook info');
      console.log(`   Error: ${currentWebhook.data.description || 'Unknown error'}\n`);
    }
    
    // Step 3: Set the new webhook
    console.log('3️⃣  Setting new webhook...');
    const setResult = await setWebhook(config.botToken, config.webhookUrl);
    
    if (setResult.status === 200 && setResult.data.ok) {
      console.log('✅ Webhook set successfully!');
    } else {
      throw new Error(`Failed to set webhook: ${setResult.data.description || 'Unknown error'}`);
    }
    
    // Step 4: Verify the webhook was set correctly
    console.log('4️⃣  Verifying webhook configuration...');
    const verifyResult = await getWebhookInfo(config.botToken);
    
    if (verifyResult.status === 200 && verifyResult.data.ok) {
      const webhookInfo = verifyResult.data.result;
      if (webhookInfo.url === config.webhookUrl) {
        console.log('✅ Webhook verification successful!');
        console.log(`   ✓ URL: ${webhookInfo.url}`);
        console.log(`   ✓ Allowed updates: ${webhookInfo.allowed_updates?.join(', ') || 'default'}`);
        console.log('🎉 Webhook setup complete!\n');
        
        console.log('📱 Your bot is now ready to receive messages!');
        console.log(`🔄 Test your bot by sending a message to: @${config.botToken.split(':')[0]}`);
      } else {
        throw new Error('Webhook URL verification failed');
      }
    } else {
      throw new Error('Could not verify webhook configuration');
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check that TELEGRAM_BOT_TOKEN is correctly set');
    console.log('2. Verify the worker URL is accessible');
    console.log('3. Ensure the bot token is valid');
    console.log('4. Try running: wrangler secret put TELEGRAM_BOT_TOKEN');
    
    process.exit(1);
  }
}

/**
 * Cleanup function to remove webhook
 */
async function removeWebhook() {
  console.log('🧹 Removing Telegram webhook...\n');
  
  const config = getConfig();
  
  try {
    const result = await deleteWebhook(config.botToken);
    
    if (result.status === 200 && result.data.ok) {
      console.log('✅ Webhook removed successfully!');
      console.log('🤖 Bot is now using polling mode (if applicable)');
    } else {
      throw new Error(`Failed to remove webhook: ${result.data.description || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'remove' || command === 'delete') {
  removeWebhook();
} else if (command === 'setup' || !command) {
  setupWebhook();
} else {
  console.log('Usage: node setup-webhook.js [setup|remove]');
  console.log('  setup  - Configure the webhook (default)');
  console.log('  remove - Remove the webhook');
  process.exit(1);
}
