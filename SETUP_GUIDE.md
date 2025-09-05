# 🚀 Quick Setup Guide

## Prerequisites
- GitHub account
- Cloudflare account
- Telegram account
- Google account (for Gemini API)

## Step-by-Step Setup

### 1. 🤖 Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the **Bot Token** (format: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

### 2. 🧠 Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Save the **API Key** (format: `AIzaSyA...`)

### 3. 🔧 Setup Cloudflare
1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to Workers & Pages
3. Get your **Account ID** from the sidebar
4. Go to "My Profile" → "API Tokens"
5. Create a token with "Edit Cloudflare Workers" permissions
6. Save the **API Token**

### 4. 📦 Setup GitHub Repository
1. Fork or clone this repository
2. Go to repository Settings → Secrets and variables → Actions
3. Add these secrets:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
WEBHOOK_SECRET=generate_random_32_character_string
WORKER_URL=https://your-worker-name.your-subdomain.workers.dev
```

### 5. 🔒 Generate Webhook Secret
Use one of these methods to generate a secure webhook secret:

**Option 1: Online Generator**
- Visit [random.org/strings](https://www.random.org/strings/)
- Generate 1 string, 32 characters, uppercase+lowercase+digits

**Option 2: Command Line**
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 8)
```

### 6. 🚀 Deploy
1. Commit and push to main branch:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. GitHub Actions will automatically:
   - Build the project
   - Deploy to Cloudflare Workers
   - Set up the Telegram webhook
   - Configure everything

### 7. ✅ Verify Setup
1. Check GitHub Actions tab for successful deployment
2. Test your bot by sending `/start` in Telegram
3. Visit your admin panel at `https://your-worker-url/admin`
4. Check health endpoint: `https://your-worker-url/health`

## 🔧 Post-Deployment Configuration

### Admin Panel Access
1. Visit `https://your-worker-url/admin`
2. Use default credentials (change immediately):
   - Username: `admin`
   - Password: `admin123`
3. Go to Settings → Change Password

### Bot Commands
- `/start` - Initialize bot
- `/help` - Show help
- `/study` - Start study session
- `/topic` - Add vocabulary from topic
- `/settings` - Configure bot

## 🛠️ Troubleshooting

### Common Issues

**Bot not responding:**
- Check webhook is set: `https://api.telegram.org/bot{YOUR_TOKEN}/getWebhookInfo`
- Verify environment variables in Cloudflare Workers
- Check logs: `npm run logs:live`

**Admin panel not accessible:**
- Verify CLOUDFLARE_API_TOKEN has correct permissions
- Check deployment logs in GitHub Actions
- Try hard refresh (Ctrl+F5)

**Build failures:**
- Check all required secrets are set
- Verify API keys are valid
- Review GitHub Actions logs

### Getting Help
1. Check the logs: `npm run logs:live`
2. Review [SECURITY.md](SECURITY.md) for security best practices
3. Open an issue with detailed error information

## 🔒 Security Notes
- Never commit API keys to version control
- Use strong passwords for admin accounts
- Regularly rotate API keys
- Monitor access logs
- Keep dependencies updated

---

🎉 **Congratulations!** Your Leitner Telegram Bot is now ready for language learning!
