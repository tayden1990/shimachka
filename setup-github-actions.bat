@echo off
REM Quick setup script for GitHub Actions deployment (Windows)
REM Run this script to set up your Cloudflare Workers deployment

echo 🚀 Setting up GitHub Actions deployment for Leitner Telegram Bot
echo =================================================================

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Wrangler CLI not found. Installing...
    npm install -g wrangler
)

REM Login to Cloudflare
echo 🔐 Please log in to Cloudflare...
wrangler auth login

REM Get account info
echo 📋 Getting your Cloudflare Account ID...
for /f "tokens=3" %%i in ('wrangler whoami ^| find "Account ID"') do set ACCOUNT_ID=%%i
echo Account ID: %ACCOUNT_ID%

REM Create KV namespaces
echo 🗄️ Creating KV namespaces...

echo Creating production namespace...
wrangler kv:namespace create "LEITNER_DB" --preview false

echo Creating preview namespace...
wrangler kv:namespace create "LEITNER_DB" --preview

echo Creating staging namespace...
wrangler kv:namespace create "LEITNER_DB" --env staging

echo ✅ KV namespaces created! Please update wrangler.toml with the namespace IDs shown above.

echo.
echo 🔧 GitHub Secrets Configuration
echo ================================
echo Add these secrets to your GitHub repository:
echo (Settings ^> Secrets and variables ^> Actions)
echo.
echo CLOUDFLARE_API_TOKEN: [Get from https://dash.cloudflare.com/profile/api-tokens]
echo CLOUDFLARE_ACCOUNT_ID: %ACCOUNT_ID%
echo TELEGRAM_BOT_TOKEN: [Get from @BotFather]
echo GEMINI_API_KEY: [Get from Google AI Studio]
echo WEBHOOK_SECRET: [Generate a random string]
echo WORKER_DOMAIN: leitner-telegram-bot.YOUR_SUBDOMAIN.workers.dev
echo.

echo 🌐 Cloudflare Environment Variables
echo ===================================
echo Set these in Cloudflare Workers dashboard:
echo (Workers ^& Pages ^> Your Worker ^> Settings ^> Variables)
echo.
echo TELEGRAM_BOT_TOKEN: [Your bot token]
echo GEMINI_API_KEY: [Your Gemini API key]
echo WEBHOOK_SECRET: [Same as GitHub secret]
echo.

echo 📚 Next Steps:
echo 1. Update wrangler.toml with the KV namespace IDs shown above
echo 2. Set up the GitHub secrets listed above
echo 3. Set up Cloudflare environment variables
echo 4. Push your code to GitHub
echo 5. Check GitHub Actions tab for deployment status
echo.
echo 🎉 Setup complete! Your bot will auto-deploy on push to main branch.

pause
