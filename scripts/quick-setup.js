#!/usr/bin/env node

/**
 * Simple Webhook Setup Tool
 * Alternative to the main script that works with environment variables
 */

const https = require('https');

/**
 * Make HTTPS request to Telegram API
 */
function makeRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Telegram-Bot-Setup/1.0'
      }
    };

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
 * Main setup function
 */
async function quickSetup() {
  console.log('🚀 Quick Telegram Bot Setup\n');

  // Get configuration from command line arguments or prompt
  const botToken = process.argv[2];
  const workerUrl = process.argv[3] || 'https://leitner-telegram-bot.t-ak-sa.workers.dev';

  if (!botToken) {
    console.log('Usage: node quick-setup.js <BOT_TOKEN> [WORKER_URL]');
    console.log('');
    console.log('Example:');
    console.log('  node quick-setup.js 1234567890:ABCDEF... https://your-worker.your-subdomain.workers.dev');
    console.log('');
    console.log('To get your bot token:');
    console.log('  1. Message @BotFather on Telegram');
    console.log('  2. Send /newbot');
    console.log('  3. Follow the instructions');
    console.log('  4. Copy the token provided');
    process.exit(1);
  }

  const webhookUrl = `${workerUrl.replace(/\/$/, '')}/webhook`;

  try {
    console.log('1️⃣  Testing worker endpoint...');
    
    // Test the worker health endpoint
    try {
      const healthResponse = await makeRequest(`${workerUrl}/health`, 'GET');
      if (healthResponse.status === 200) {
        console.log('   ✅ Worker is accessible');
      } else {
        console.log('   ⚠️  Worker responded but might have issues');
      }
    } catch (error) {
      console.log('   ⚠️  Could not reach worker (this might be normal for fresh deployments)');
    }

    console.log('\n2️⃣  Getting current webhook info...');
    const webhookInfoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    const currentInfo = await makeRequest(webhookInfoUrl, 'GET');
    
    if (currentInfo.status === 200 && currentInfo.data.ok) {
      const info = currentInfo.data.result;
      console.log(`   Current URL: ${info.url || 'None'}`);
      console.log(`   Pending updates: ${info.pending_update_count || 0}`);
      if (info.last_error_message) {
        console.log(`   Last error: ${info.last_error_message}`);
      }
    }

    console.log('\n3️⃣  Setting new webhook...');
    const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    const setData = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false
    };

    const setResult = await makeRequest(setWebhookUrl, 'POST', setData);
    
    if (setResult.status === 200 && setResult.data.ok) {
      console.log('   ✅ Webhook set successfully!');
    } else {
      throw new Error(`Failed to set webhook: ${setResult.data.description || 'Unknown error'}`);
    }

    console.log('\n4️⃣  Verifying setup...');
    const verifyResult = await makeRequest(webhookInfoUrl, 'GET');
    
    if (verifyResult.status === 200 && verifyResult.data.ok) {
      const info = verifyResult.data.result;
      if (info.url === webhookUrl) {
        console.log('   ✅ Verification successful!');
        console.log(`   📱 Webhook URL: ${info.url}`);
      } else {
        console.log('   ❌ Webhook URL mismatch');
      }
    }

    console.log('\n🎉 Setup complete!');
    console.log('\n📱 Test your bot:');
    console.log('   1. Find your bot on Telegram');
    console.log('   2. Send /start');
    console.log('   3. Try commands like /help or /add');
    
    console.log('\n🔧 Useful URLs:');
    console.log(`   • Bot: ${workerUrl}`);
    console.log(`   • Admin: ${workerUrl}/admin`);
    console.log(`   • Health: ${workerUrl}/health`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Verify your bot token is correct');
    console.log('   • Check that your worker is deployed');
    console.log('   • Ensure the worker URL is accessible');
    console.log('   • Try again in a few minutes');
    process.exit(1);
  }
}

// Handle removal
async function quickRemove() {
  const botToken = process.argv[3];
  
  if (!botToken) {
    console.log('Usage: node quick-setup.js remove <BOT_TOKEN>');
    process.exit(1);
  }

  try {
    console.log('🧹 Removing webhook...\n');
    
    const deleteUrl = `https://api.telegram.org/bot${botToken}/deleteWebhook`;
    const result = await makeRequest(deleteUrl, 'POST', { drop_pending_updates: true });
    
    if (result.status === 200 && result.data.ok) {
      console.log('✅ Webhook removed successfully!');
      console.log('🤖 Bot is now using polling mode (if supported)');
    } else {
      throw new Error(`Failed to remove webhook: ${result.data.description || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Check command
const command = process.argv[2];
if (command === 'remove') {
  quickRemove();
} else {
  quickSetup();
}
