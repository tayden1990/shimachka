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

### Installation & Deployment

#### Option 1: Automatic Deployment with GitHub Actions (Recommended)

1. **Fork or clone this repository to GitHub**

2. **Run the setup script:**
   ```bash
   # On Windows
   ./setup-github-actions.bat
   
   # On macOS/Linux
   chmod +x setup-github-actions.sh
   ./setup-github-actions.sh
   ```

3. **Set up GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - [Get from Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `WEBHOOK_SECRET` - Any random string
   - `WORKER_DOMAIN` - Your worker domain (e.g., `leitner-telegram-bot.your-subdomain.workers.dev`)

4. **Set up Cloudflare Environment Variables:**
   In Cloudflare dashboard → Workers & Pages → Your Worker → Settings → Variables:
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `WEBHOOK_SECRET`

5. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

   Your bot will automatically deploy! 🚀

#### Option 2: Manual Deployment

1. **Clone and setup the project:**
```bash
npm install
```

2. **Configure environment variables in Cloudflare:**
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `WEBHOOK_SECRET`: A random secret for webhook security

3. **Create KV namespace:**
```bash
npx wrangler kv:namespace create "LEITNER_DB"
npx wrangler kv:namespace create "LEITNER_DB" --preview
```

4. **Update wrangler.toml with your KV namespace IDs**

5. **Deploy to Cloudflare Workers:**
```bash
npm run deploy
```

6. **Set up the webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-worker.your-subdomain.workers.dev/webhook"}'
```

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

### Build
```bash
npm run build
```

### Manual Deploy
```bash
npm run deploy
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
