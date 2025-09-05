# Leitner Telegram Bot

A powerful Telegram bot that implements the Leitner spaced repetition system for language learning, powered by Cloudflare Workers and Google's Gemini AI.

## Features

🎯 **Smart Vocabulary Learning**
- Automatic word extraction from any topic using AI
- Multi-language support (19+ languages)
- Intelligent spaced repetition using the Leitner system
- Manual word addition with AI-generated definitions

📊 **Progress Tracking**
- 5-box Leitner system implementation
- Study statistics and accuracy tracking
- Daily study streaks
- Progress visualization

🔔 **Smart Reminders**
- Customizable daily reminder times
- Intelligent scheduling based on card due dates
- Automatic reminder system

🌐 **Multi-language Support**
- 19 supported languages including English, Spanish, French, German, Russian, Chinese, Japanese, and more
- Automatic language detection
- Source and target language configuration

## Quick Start

### Prerequisites

1. **Telegram Bot Token**: Get one from [@BotFather](https://t.me/BotFather)
2. **Google Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
4. **Node.js**: Version 18+ installed locally
5. **GitHub Repository**: For automatic deployment

### Deployment (GitHub Actions Only)

**🔐 Security Note**: This project uses secure deployment practices with encrypted secrets and environment variables.

**GitHub Actions automatically handles everything:**

1. **Configure repository secrets** (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN` - [Get from Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - `CLOUDFLARE_ACCOUNT_ID` - Found in Cloudflare dashboard sidebar
   - `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `WEBHOOK_SECRET` - Generate a random string (32+ characters)
   - `WORKER_URL` - Your worker URL (optional, defaults to template)

2. **Set up Cloudflare Environment Variables** (Workers Dashboard → Settings → Environment Variables):
   - `TELEGRAM_BOT_TOKEN` - Your bot token
   - `GEMINI_API_KEY` - Your API key  
   - `WEBHOOK_SECRET` - Same random string as GitHub secret

3. **Deploy:**
```bash
git add .
git commit -m "Deploy with automatic webhook"
git push origin main
```

**✅ GitHub Actions automatically deploys and configures webhook!**

## 🔒 Security Features

- **Password Hashing**: Secure password storage with SHA-256 + salt
- **Authentication**: JWT-based admin authentication
- **Input Validation**: All user inputs are validated and sanitized
- **Environment Security**: No API keys in source code
- **HTTPS Only**: All communications encrypted
- **Access Control**: Role-based admin panel access

See [SECURITY.md](SECURITY.md) for detailed security information.
npm run setup-webhook-local
```

### Webhook Management

#### Automatic Setup in GitHub Actions
- Set `TELEGRAM_BOT_TOKEN` in GitHub repository secrets
- Push to main branch
- GitHub Actions automatically deploys and configures webhook
- Includes verification and error handling

#### Local Development Setup
```bash
# Method 1: Export token temporarily (Quick testing)
export TELEGRAM_BOT_TOKEN=your_bot_token_here  # Linux/Mac
set TELEGRAM_BOT_TOKEN=your_bot_token_here     # Windows
npm run setup-webhook

# Method 2: Use wrangler secrets (Recommended for local dev)
wrangler secret put TELEGRAM_BOT_TOKEN
# Note: You'll still need to export for local webhook setup
## Usage

### Basic Commands

- `/start` - Welcome message and setup
- `/help` - Show all available commands
- `/study` - Start a review session
- `/add <word> <translation>` - Manually add a word
- `/topic <subject>` - Generate vocabulary from a topic
- `/stats` - View your learning statistics
- `/settings` - Configure languages and reminders
- `/languages` - List supported languages

### Multi-Language Support

The bot supports multiple interface languages:
- **English** (en) - Default
- **Persian/Farsi** (fa) - فارسی
- **Arabic** (ar) - العربية  
- **Spanish** (es) - Español
- **Russian** (ru) - Русский

Users can change the interface language via `/settings` → Interface Language.

### Admin Panel

Access the admin dashboard at: `https://your-worker.your-subdomain.workers.dev/admin`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Change the default password immediately after first login!

Admin features include:
- User management and analytics
- Bulk word assignments
- Direct messaging to users
- Support ticket management
- System monitoring and reports

For detailed admin setup instructions, see [ADMIN_SETUP.md](./ADMIN_SETUP.md).

### Example Usage

1. **Generate vocabulary from a topic:**
   ```
   /topic cooking
   ```
   The bot will extract 10 cooking-related words with translations and definitions.

2. **Add words manually:**
   ```
   /add bonjour hello
   ```

3. **Start studying:**
   ```
   /study
   ```
   Review cards using the interactive interface.

## How the Leitner System Works

The Leitner system uses 5 boxes with increasing review intervals:

- **Box 1**: Review daily (new words)
- **Box 2**: Review every 2 days
- **Box 3**: Review every 4 days
- **Box 4**: Review every 8 days
- **Box 5**: Review every 16 days (mastered words)

When you get a word correct, it moves to the next box. When incorrect, it goes back to Box 1.

## Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Turkish, Polish, Dutch, Swedish, Danish, Norwegian, Finnish

## Architecture

- **Cloudflare Workers**: Serverless runtime for the bot
- **Cloudflare KV**: Data storage for users, cards, and sessions
- **Google Gemini AI**: Word extraction and translation
- **Telegram Bot API**: User interface

## Development

### Automatic Deployment
The project includes GitHub Actions for automatic deployment:
- **Simple Deployment**: Deploys on push to main/master branch
- **CI/CD Pipeline**: Includes testing, staging, and production environments

See [DEPLOYMENT.md](.github/DEPLOYMENT.md) for detailed setup instructions.

### Local Development
```bash
npm run dev
```

## 📊 Monitoring & Logging

This project includes comprehensive monitoring and logging capabilities:

### Real-time Monitoring
```bash
# View live logs with pretty formatting
npm run logs:live

# View raw logs
npm run logs

# Search logs for specific terms
npm run logs:search "ERROR"
```

### Health Monitoring
```bash
# Check service status
npm run health

# Debug endpoint
curl https://your-worker.your-subdomain.workers.dev/debug
```

### Available Monitoring Features
- **Analytics Engine Integration**: Track all bot events and performance metrics
- **Real-time Error Tracking**: Immediate notification of issues
- **Performance Monitoring**: Request times, success rates, and resource usage
- **User Activity Analytics**: Command usage patterns and engagement metrics
- **Custom Dashboards**: Visual monitoring of key metrics

### Debug Commands
```bash
# Local development with enhanced logging
npm run debug

# View analytics data
npm run analytics
```

### Monitoring Documentation
For detailed monitoring setup and troubleshooting, see [docs/logging-monitoring.md](docs/logging-monitoring.md)

### Build
```bash
npm run build
```

### Manual Deploy
```bash
# Complete deployment with webhook setup
npm run deploy

# Deploy only (no webhook configuration)
npm run deploy-only

# Setup webhook after deployment
npm run setup-webhook

# Remove webhook
npm run remove-webhook
```

## Configuration

### Environment Variables

Set these in your Cloudflare Workers dashboard:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
WEBHOOK_SECRET=your_webhook_secret
```

### Cron Jobs

The bot includes automatic daily reminders configured in `wrangler.toml`:
```toml
[triggers]
crons = ["0 8,14,20 * * *"]  # 8 AM, 2 PM, and 8 PM daily
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the documentation
2. Open an issue on GitHub
3. Contact support

---

Built with ❤️ using Cloudflare Workers and Google AI
