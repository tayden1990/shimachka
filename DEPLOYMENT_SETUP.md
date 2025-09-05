# GitHub Actions Deployment Setup Guide

## 🚀 Setup GitHub Actions for Automatic Deployment

### Step 1: Get Your Cloudflare Credentials

1. **Get Cloudflare Account ID:**
   ```bash
   npx wrangler whoami
   ```
   This will show your account ID.

2. **Create Cloudflare API Token:**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Account: Select your account
   - Zone: All zones (or specific if you have one)
   - Copy the token

### Step 2: Set GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **CLOUDFLARE_API_TOKEN**
   - Value: The API token from Step 1

2. **CLOUDFLARE_ACCOUNT_ID**  
   - Value: Your account ID from `npx wrangler whoami`

3. **TELEGRAM_BOT_TOKEN**
   - Value: `8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks`

4. **WEBHOOK_SECRET**
   - Value: `your_webhook_secret_here`

5. **WORKER_DOMAIN**
   - Value: `leitner-telegram-bot.YOUR-SUBDOMAIN.workers.dev`
   - Replace YOUR-SUBDOMAIN with your actual Cloudflare subdomain

### Step 3: Update the Workflow

The workflow is already set up to:
- ✅ Deploy on every push to main branch
- ✅ Set up Telegram webhook automatically
- ✅ Verify webhook status

### Step 4: Test the Deployment

1. Make any small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push origin main
   ```

3. Check the Actions tab in your GitHub repository to see the deployment progress

### Step 5: Get Your Worker URL

After deployment, your bot will be available at:
`https://leitner-telegram-bot.YOUR-SUBDOMAIN.workers.dev`

You can find your exact URL by running:
```bash
npx wrangler whoami
```

### Troubleshooting

If the bot doesn't work after deployment:

1. Check GitHub Actions logs for errors
2. Verify all secrets are set correctly
3. Check Cloudflare Workers logs in the dashboard
4. Test webhook manually:
   ```bash
   curl "https://api.telegram.org/bot8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks/getWebhookInfo"
   ```

### Manual Webhook Setup (if needed)

If automatic webhook setup fails, run this manually:
```bash
curl -X POST "https://api.telegram.org/bot8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://leitner-telegram-bot.YOUR-SUBDOMAIN.workers.dev/webhook", "secret_token": "your_webhook_secret_here"}'
```

## 🎯 What Happens on Each Push

1. **Code Push** → GitHub receives push
2. **Build** → GitHub Actions runs TypeScript compilation  
3. **Deploy** → Code deployed to Cloudflare Workers
4. **Webhook** → Telegram webhook automatically updated
5. **Bot Active** → Your bot is live and ready to use!

Just push your code to GitHub and everything will be deployed automatically! 🚀
