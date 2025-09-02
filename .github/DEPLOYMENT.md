# GitHub Actions Deployment Setup

This guide will help you set up automatic deployment to Cloudflare Workers when you push to GitHub.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Cloudflare Account**: With Workers and KV enabled
3. **API Tokens**: From Cloudflare dashboard

## Step 1: Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Set permissions:
   - Zone: Zone Settings:Read, Zone:Read
   - Account: Cloudflare Workers:Edit
   - Zone Resources: Include All zones

## Step 2: Get Account ID

1. In Cloudflare Dashboard, go to Workers & Pages
2. Copy your Account ID from the right sidebar

## Step 3: Create KV Namespaces

```bash
# Production namespace
npx wrangler kv:namespace create "LEITNER_DB"

# Staging namespace (optional)
npx wrangler kv:namespace create "LEITNER_DB" --env staging
```

Update the namespace IDs in `wrangler.toml`.

## Step 4: Set GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

### Required Secrets:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `TELEGRAM_BOT_TOKEN` - Your production Telegram bot token
- `GEMINI_API_KEY` - Your Google Gemini API key
- `WEBHOOK_SECRET` - Random string for webhook security
- `WORKER_DOMAIN` - Your worker domain (e.g., your-worker.your-subdomain.workers.dev)

### Optional (for staging):
- `TELEGRAM_BOT_TOKEN_STAGING` - Staging bot token
- `WEBHOOK_SECRET_STAGING` - Staging webhook secret

## Step 5: Set Environment Variables in Cloudflare

1. Go to Workers & Pages > Your Worker > Settings > Variables
2. Add the same environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `WEBHOOK_SECRET`

## Step 6: Configure Environments (Optional)

If you want staging/production environments:

1. In GitHub repo: Settings > Environments
2. Create "production" and "staging" environments
3. Set protection rules (e.g., require reviews for production)

## Workflow Files

### Simple Deployment (`deploy.yml`)
- Triggers on push to main/master
- Builds and deploys directly

### CI/CD Pipeline (`ci-cd.yml`)
- Runs tests and type checking
- Deploys to staging on develop branch
- Deploys to production on main/master branch
- Automatically sets up webhook after deployment

## Usage

### For Production Deployment:
```bash
git add .
git commit -m "Update bot features"
git push origin main
```

### For Staging Deployment:
```bash
git checkout develop
git add .
git commit -m "Test new features"
git push origin develop
```

## Monitoring

1. Check GitHub Actions tab for deployment status
2. View Cloudflare Workers logs for runtime issues
3. Test bot functionality after deployment

## Troubleshooting

### Common Issues:

1. **"Invalid API token"**
   - Check token permissions
   - Ensure token hasn't expired

2. **"KV namespace not found"**
   - Update namespace IDs in wrangler.toml
   - Ensure namespaces exist in correct environment

3. **"Environment variables not found"**
   - Check Cloudflare dashboard environment variables
   - Verify GitHub secrets are set correctly

4. **Webhook not working**
   - Check worker domain in WORKER_DOMAIN secret
   - Verify Telegram bot token is correct
   - Test webhook URL manually

### Debug Commands:

```bash
# Test local deployment
npm run dev

# Manual deployment
npx wrangler deploy

# Check KV namespaces
npx wrangler kv:namespace list

# View worker logs
npx wrangler tail
```

## Security Best Practices

1. Never commit API tokens to the repository
2. Use environment-specific tokens for staging/production
3. Regularly rotate API tokens
4. Use webhook secrets to verify requests
5. Monitor deployment logs for sensitive data leaks

## Next Steps

After setting up GitHub Actions:

1. Create your first pull request to test the workflow
2. Set up monitoring and alerting
3. Configure branch protection rules
4. Set up automated testing
5. Consider setting up a staging environment

Your bot will now automatically deploy whenever you push to your repository! 🚀
