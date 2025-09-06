# Telegram Bot Command Troubleshooting Guide

## Issue: `/start` command not working

### Quick Fixes Applied ✅

1. **Fixed Command Parsing Bug** - There was a missing space in the command handling logic
2. **Enhanced User Creation** - Added proper `isRegistrationComplete` field handling
3. **Added Comprehensive Debugging** - Extensive logging for troubleshooting

### Troubleshooting Steps

#### 1. Check Bot Token and Webhook
```powershell
# Test webhook status
.\test-webhook.ps1 -BOT_TOKEN "YOUR_BOT_TOKEN"

# Debug bot info
.\debug-bot.ps1 -BOT_TOKEN "YOUR_BOT_TOKEN"
```

#### 2. Deploy Updated Code
```powershell
# Build and deploy
npm run build
npm run deploy
```

#### 3. Reset Webhook (if needed)
```powershell
# Run the webhook setup
.\setup-webhook.ps1
```

#### 4. Test in Telegram
- Send `/start` to your bot
- Check Cloudflare Workers logs for debugging output

### Common Issues & Solutions

#### Issue: "Bot doesn't respond to any commands"
**Causes:**
- Webhook not properly configured
- Bot token incorrect
- Cloudflare Worker not deployed
- Worker URL not accessible

**Solutions:**
1. Verify bot token in secrets: `wrangler secret put TELEGRAM_BOT_TOKEN`
2. Check webhook URL: should match your deployed worker
3. Test worker URL directly in browser
4. Check Cloudflare dashboard for errors

#### Issue: "Bot responds but commands don't work"
**Causes:**
- Command parsing error (FIXED ✅)
- User registration state issues
- Database/KV storage problems

**Solutions:**
1. Use `/debug_state` command to check user state
2. Use `/reset_registration` to clear user state
3. Check KV namespace binding in wrangler.toml

#### Issue: "Registration flow gets stuck"
**Causes:**
- Missing conversation state
- Callback query handling issues
- Language selection problems

**Solutions:**
1. Send `/start` again to restart registration
2. Use callback buttons instead of text input
3. Check worker logs for specific errors

### Environment Variables Required

Make sure these secrets are set:
```powershell
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put GEMINI_API_KEY
```

### Debug Commands Available

- `/debug_state` - Shows user and conversation state
- `/reset_registration` - Clears registration state
- `/start` - Begins registration or shows main menu

### Logs to Check

#### In Cloudflare Workers Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Go to Logs tab
4. Look for these patterns:
   - `🔵 Received Telegram update`
   - `🚀 /start command received`
   - `❌` error indicators
   - `✅` success indicators

#### Expected Log Flow for /start:
```
🔵 Received Telegram update
📨 Message received
🔄 Processing message
👤 User lookup result
🤖 handleCommand called
🚀 /start command received
✅ User is registered, sending welcome message
📤 Sending message to chat
✅ Message sent successfully
```

### Testing Checklist

- [ ] Bot token is correct and set as secret
- [ ] Webhook URL points to deployed worker
- [ ] Worker is deployed and accessible
- [ ] KV namespace is properly bound
- [ ] `/start` command triggers registration or welcome
- [ ] Bot responds within 30 seconds
- [ ] Logs show successful message processing

### Manual Testing Commands

```powershell
# Test bot info
curl -X GET "https://api.telegram.org/bot<TOKEN>/getMe"

# Test webhook info  
curl -X GET "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Test worker endpoint
curl -X GET "https://your-worker.your-subdomain.workers.dev/"
```

### If Nothing Works

1. **Complete Reset:**
   ```powershell
   # Delete webhook
   curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
   
   # Redeploy worker
   npm run deploy
   
   # Set webhook again
   .\setup-webhook.ps1
   ```

2. **Check Bot Permissions:**
   - Bot should have permission to send messages
   - Bot should not be blocked by user
   - Bot should be added to correct chat

3. **Verify Worker URL:**
   - URL should be HTTPS
   - Should return 200 OK for GET requests
   - Should be accessible from Telegram servers

### Success Indicators

✅ Webhook status shows your worker URL
✅ Bot responds to `/start` with registration or welcome
✅ Worker logs show message processing
✅ No error messages in Cloudflare dashboard
✅ Bot responds within reasonable time

If you still have issues after following this guide, check the specific error messages in the worker logs and provide them for further troubleshooting.
