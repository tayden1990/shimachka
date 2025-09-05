# Deployment & Webhook Setup Guide

This guide covers all the different ways to deploy your Leitner Telegram Bot and set up the webhook automatically.

## 🚀 Deployment Options

### Option 1: GitHub Actions (Recommended for Production)

**✅ Fully Automatic - Zero Configuration Required**

1. **Set GitHub Secrets** (One-time setup):
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
     CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
     ```

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy with automatic webhook"
   git push origin main
   ```

3. **Result**:
   - ✅ Automatically builds and deploys to Cloudflare Workers
   - ✅ Automatically configures Telegram webhook
   - ✅ Verifies webhook is working
   - ✅ Shows deployment summary with all URLs

### Option 2: Local Development (Manual)

**🔧 For testing and development**

1. **Deploy without webhook**:
   ```bash
   npm run deploy-only
   ```

2. **Set up webhook manually**:
   ```bash
   # Quick setup (temporary token)
   export TELEGRAM_BOT_TOKEN=your_bot_token_here  # Linux/Mac
   set TELEGRAM_BOT_TOKEN=your_bot_token_here     # Windows
   npm run setup-webhook
   
   # Or get help
   npm run setup-webhook-local
   ```

### Option 3: Local Development (Semi-Automatic)

**⚡ Best of both worlds**

1. **Set token in environment**:
   ```bash
   export TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

2. **Deploy with automatic webhook**:
   ```bash
   npm run deploy
   ```

## 🎯 Available Commands

### Deployment Commands
```bash
npm run deploy           # Deploy + automatic webhook setup
npm run deploy-only      # Deploy without webhook
```

### Webhook Management
```bash
npm run setup-webhook         # Setup webhook (requires token in env)
npm run setup-webhook-local   # Get help for local setup
npm run setup-webhook-ps      # PowerShell version (Windows)
npm run remove-webhook        # Remove webhook
```

### Development Commands
```bash
npm run dev              # Start local development server
npm run build            # Build TypeScript
npm run logs             # View worker logs
npm run health           # Check health status
```

## 🔧 Webhook Setup Details

### What the Setup Does
1. **Validates Environment**: Checks for bot token and worker URL
2. **Tests Worker**: Verifies the deployed worker is accessible
3. **Gets Current Webhook**: Checks existing webhook configuration
4. **Sets New Webhook**: Configures Telegram webhook with:
   - Correct worker URL + `/webhook` path
   - Proper allowed updates (message, callback_query, etc.)
   - Optimal settings for the bot
5. **Verifies Setup**: Confirms webhook is working correctly

### Environment Variables
- `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
- `WORKER_URL`: Your Cloudflare Worker URL (auto-detected)
- `GITHUB_ACTIONS`: Auto-detected (enables GitHub Actions mode)

## 🚨 Troubleshooting

### Common Issues

**❌ "TELEGRAM_BOT_TOKEN not found"**
- **GitHub Actions**: Check repository secrets are set correctly
- **Local**: Export the token: `export TELEGRAM_BOT_TOKEN=your_token`

**❌ "Worker endpoint not accessible"**
- Wait a few seconds after deployment for propagation
- Check the worker URL is correct
- Verify deployment was successful

**❌ "Failed to set webhook"**
- Check bot token is valid
- Ensure bot token has webhook permissions
- Verify worker URL is accessible from internet

**❌ "Webhook verification failed"**
- Worker might not be fully ready yet
- Check `/webhook` endpoint exists in your worker
- Verify no conflicting webhook is set

### Debug Commands
```bash
# Check current webhook status
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"

# Test worker health
curl "https://your-worker.workers.dev/health"

# Check webhook endpoint
curl "https://your-worker.workers.dev/webhook"
```

## 🏆 Best Practices

### For Production
- ✅ Use GitHub Actions for deployment
- ✅ Set secrets in GitHub repository settings
- ✅ Use automatic webhook setup
- ✅ Monitor deployment logs

### For Development
- ✅ Use `npm run deploy-only` for quick deploys
- ✅ Set up webhook manually when testing
- ✅ Use `npm run setup-webhook-local` for guidance
- ✅ Keep bot token in environment variables

### Security
- ✅ Never commit bot tokens to repository
- ✅ Use GitHub secrets for production
- ✅ Use wrangler secrets for local development
- ✅ Rotate tokens regularly

## 📱 After Deployment

Once deployed successfully, you'll have:

- 🤖 **Telegram Bot**: Ready to receive messages
- 🔗 **Webhook**: Automatically configured
- 🔧 **Admin Panel**: `https://your-worker.workers.dev/admin`
- 📊 **Health Check**: `https://your-worker.workers.dev/health`
- 📈 **Monitoring**: Built-in logging and metrics

Start using your bot by sending `/start` to it in Telegram!
