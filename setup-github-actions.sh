#!/bin/bash

# Quick setup script for GitHub Actions deployment
# Run this script to set up your Cloudflare Workers deployment

echo "🚀 Setting up GitHub Actions deployment for Leitner Telegram Bot"
echo "================================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Please log in to Cloudflare..."
wrangler auth login

# Get account ID
echo "📋 Getting your Cloudflare Account ID..."
ACCOUNT_ID=$(wrangler whoami | grep "Account ID" | awk '{print $3}')
echo "Account ID: $ACCOUNT_ID"

# Create KV namespaces
echo "🗄️ Creating KV namespaces..."

echo "Creating production namespace..."
PROD_KV=$(wrangler kv:namespace create "LEITNER_DB" --preview false)
PROD_ID=$(echo $PROD_KV | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

echo "Creating preview namespace..."
PREVIEW_KV=$(wrangler kv:namespace create "LEITNER_DB" --preview)
PREVIEW_ID=$(echo $PREVIEW_KV | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

# Update wrangler.toml
echo "📝 Updating wrangler.toml with namespace IDs..."
sed -i.bak "s/your_production_namespace_id/$PROD_ID/g" wrangler.toml
sed -i.bak "s/your_preview_namespace_id/$PREVIEW_ID/g" wrangler.toml

# Create staging namespace (optional)
echo "Creating staging namespace..."
STAGING_KV=$(wrangler kv:namespace create "LEITNER_DB" --env staging)
STAGING_ID=$(echo $STAGING_KV | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
sed -i.bak "s/your_staging_namespace_id/$STAGING_ID/g" wrangler.toml

echo "✅ KV namespaces created and configured!"

# Get worker domain
WORKER_NAME=$(grep '^name = ' wrangler.toml | cut -d'"' -f2)
WORKER_DOMAIN="$WORKER_NAME.YOUR_SUBDOMAIN.workers.dev"

echo ""
echo "🔧 GitHub Secrets Configuration"
echo "================================"
echo "Add these secrets to your GitHub repository:"
echo "(Settings > Secrets and variables > Actions)"
echo ""
echo "CLOUDFLARE_API_TOKEN: [Get from https://dash.cloudflare.com/profile/api-tokens]"
echo "CLOUDFLARE_ACCOUNT_ID: $ACCOUNT_ID"
echo "TELEGRAM_BOT_TOKEN: [Get from @BotFather]"
echo "GEMINI_API_KEY: [Get from Google AI Studio]"
echo "WEBHOOK_SECRET: [Generate a random string]"
echo "WORKER_DOMAIN: $WORKER_DOMAIN"
echo ""

echo "🌐 Cloudflare Environment Variables"
echo "==================================="
echo "Set these in Cloudflare Workers dashboard:"
echo "(Workers & Pages > Your Worker > Settings > Variables)"
echo ""
echo "TELEGRAM_BOT_TOKEN: [Your bot token]"
echo "GEMINI_API_KEY: [Your Gemini API key]"
echo "WEBHOOK_SECRET: [Same as GitHub secret]"
echo ""

echo "📚 Next Steps:"
echo "1. Set up the GitHub secrets listed above"
echo "2. Set up Cloudflare environment variables"
echo "3. Push your code to GitHub"
echo "4. Check GitHub Actions tab for deployment status"
echo ""
echo "🎉 Setup complete! Your bot will auto-deploy on push to main branch."
