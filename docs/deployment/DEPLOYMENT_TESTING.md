# 🚀 Deployment Testing & Debugging Guide

## 📋 Pre-Deployment Checklist

### 1. GitHub Secrets Configuration
Ensure these secrets are set in your GitHub repository:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
TELEGRAM_BOT_TOKEN=your_bot_token
GEMINI_API_KEY=your_gemini_api_key
WEBHOOK_SECRET=your_secure_random_string
WORKER_DOMAIN=your-worker.your-subdomain.workers.dev
```

### 2. Telegram Bot Setup
1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your bot token
3. Set bot commands with `/setcommands`:
   ```
   start - Start the bot and begin registration
   help - Show help information
   menu - Show main menu
   study - Start study session
   add - Add new words
   mywords - View your words
   mytopics - View your topics
   settings - Bot settings
   ```

## 🛠️ Deployment Process

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions will automatically:
   - Build the TypeScript
   - Deploy to Cloudflare Workers
   - Set the Telegram webhook
   - Verify the deployment

### Manual Deployment
```bash
# Build and deploy manually
npm run build
npx wrangler deploy

# Set webhook manually
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"https://<YOUR_WORKER_DOMAIN>/webhook\", \"secret_token\": \"<YOUR_WEBHOOK_SECRET>\"}"
```

## 🔍 Testing & Debugging Endpoints

### 1. Health Check
```bash
curl https://your-worker.workers.dev/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-05T10:00:00.000Z",
  "version": "1.0.0",
  "environment": {
    "botTokenSet": true,
    "geminiKeySet": true,
    "kvSet": true,
    "webhookSecretSet": true
  },
  "webhook_test": "Send a message to your bot to test webhook functionality"
}
```

### 2. Webhook Information
```bash
curl https://your-worker.workers.dev/webhook-info
```
**Expected Response:**
```json
{
  "webhook_info": {
    "url": "https://your-worker.workers.dev/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": null,
    "max_connections": 40,
    "secret_token": "***"
  },
  "current_time": "2025-01-05T10:00:00.000Z",
  "worker_url": "https://your-worker.workers.dev/webhook"
}
```

### 3. Test Webhook Processing
```bash
curl -X POST https://your-worker.workers.dev/test-webhook
```
This simulates a `/start` command from a test user.

## 🧪 Bot Testing Scenarios

### 1. Basic Bot Functionality Test
1. **Test `/start` command:**
   - Send `/start` to your bot
   - Should receive registration flow or welcome message
   - Check logs in Cloudflare Workers dashboard

2. **New User Registration:**
   - Use a fresh Telegram account
   - Send `/start`
   - Complete the registration flow
   - Verify user data is stored

3. **Existing User:**
   - Use a registered account
   - Send `/start`
   - Should receive welcome message with main menu

### 2. Command Testing
Test each command:
- `/help` - Should show help message
- `/menu` - Should show main menu with buttons
- `/study` - Should start study session or prompt for words
- `/add` - Should start word addition flow
- `/mywords` - Should show user's words
- `/mytopics` - Should show user's topics
- `/settings` - Should show settings menu

## 📊 Monitoring & Logging

### 1. Cloudflare Workers Logs
1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your worker
4. Go to "Logs" tab
5. Enable "Real-time logs"

### 2. Log Messages to Look For
- `🔵 Received Telegram update:` - Webhook received
- `📨 Message received:` - User message processing
- `🚀 /start command received for user:` - Start command
- `👤 User data:` - User lookup results
- `✅ User is registered, sending welcome message` - Existing user
- `📝 Starting registration flow for user` - New user
- `✅ Webhook processed successfully` - Successful processing

### 3. Error Indicators
- `❌ Webhook error:` - Webhook processing failed
- `⚠️ Invalid message: missing from or text` - Malformed message
- `Failed to start AI processing` - AI service issues

## 🐛 Troubleshooting Common Issues

### 1. Webhook Not Working
**Symptoms:** Bot doesn't respond to messages

**Check:**
```bash
# Verify webhook is set correctly
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"

# Check health endpoint
curl https://your-worker.workers.dev/health
```

**Solutions:**
- Re-set webhook with correct URL
- Check if WORKER_DOMAIN secret is correct
- Verify bot token is valid

### 2. Environment Variables Missing
**Symptoms:** 500 errors, "botTokenSet": false in health check

**Solutions:**
- Verify GitHub secrets are set correctly
- Check wrangler.toml configuration
- Re-deploy after fixing secrets

### 3. Database/KV Issues
**Symptoms:** User registration fails, data not persisting

**Check:**
- KV namespace is created and bound
- Check logs for KV-related errors

### 4. AI Processing Fails
**Symptoms:** "Failed to start AI processing" errors

**Check:**
- GEMINI_API_KEY is valid
- Check if mock mode is working (for testing)
- Verify AI service logs

## 📝 Testing Checklist

### Pre-Release Testing
- [ ] Health endpoint returns 200 OK
- [ ] Webhook info shows correct URL
- [ ] `/start` command works for new users
- [ ] `/start` command works for existing users
- [ ] Registration flow completes successfully
- [ ] All menu commands respond correctly
- [ ] Word addition flow works
- [ ] Study session functions
- [ ] Admin panel is accessible
- [ ] Bulk messaging works
- [ ] AI word processing works (mock mode)

### Post-Deployment Verification
- [ ] GitHub Actions deployment succeeded
- [ ] Webhook was set successfully
- [ ] Health check passes
- [ ] Real bot responds to messages
- [ ] Logs show proper activity
- [ ] No error messages in logs
- [ ] All features function as expected

## 🔧 Quick Debug Commands

```bash
# Get webhook status
curl "https://api.telegram.org/bot$TOKEN/getWebhookInfo"

# Reset webhook
curl -X POST "https://api.telegram.org/bot$TOKEN/deleteWebhook"
curl -X POST "https://api.telegram.org/bot$TOKEN/setWebhook" \
     -d "url=https://your-worker.workers.dev/webhook&secret_token=$SECRET"

# Test bot directly
curl -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
     -d "chat_id=$CHAT_ID&text=Test message"

# Health check
curl https://your-worker.workers.dev/health

# Test webhook processing
curl -X POST https://your-worker.workers.dev/test-webhook
```

## 📞 Support Endpoints

- **Health:** `GET /health`
- **Webhook Info:** `GET /webhook-info`
- **Test Webhook:** `POST /test-webhook`
- **Admin Panel:** `GET /admin`
- **Debug Info:** `GET /debug`

This comprehensive testing guide will help you verify that your Leitner Bot is properly deployed and functioning correctly in the production environment.
