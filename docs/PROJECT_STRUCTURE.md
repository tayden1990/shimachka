# Project Structure

## 📁 Directory Organization

```
shimachka/
├── 📁 src/                     # Source code
│   ├── 📁 admin/               # Admin panel components
│   │   ├── admin-html.ts       # Admin interface HTML template
│   │   └── index.html          # Static admin page
│   ├── 📁 api/                 # API endpoints
│   │   └── admin-api.ts        # Admin API handlers
│   ├── 📁 bot/                 # Telegram bot implementation
│   │   └── leitner-bot.ts      # Main bot logic
│   ├── 📁 services/            # Business logic services
│   │   ├── admin-service.ts    # Admin management
│   │   ├── conversation-state-manager.ts  # Chat state management
│   │   ├── health-check.ts     # Health monitoring
│   │   ├── kv-optimizer.ts     # KV storage optimization
│   │   ├── language-manager.ts # Multi-language support
│   │   ├── logger.ts           # Structured logging
│   │   ├── schedule-manager.ts # Review scheduling
│   │   ├── user-manager.ts     # User management
│   │   └── word-extractor.ts   # AI word extraction
│   ├── 📁 types/               # TypeScript definitions
│   │   ├── conversation-state.ts # Chat state types
│   │   └── index.ts            # Main type definitions
│   ├── index.ts                # Main entry point
│   └── init-admin.ts           # Admin initialization
├── 📁 docs/                    # Documentation
│   ├── 📁 admin/               # Admin system docs
│   ├── 📁 deployment/          # Deployment guides
│   ├── 📁 features/            # Feature specifications
│   ├── 📁 monitoring/          # Monitoring configuration
│   └── 📄 Various guides and improvements
├── 📁 scripts/                 # Utility scripts
│   └── verify-webhook.mjs      # Webhook verification utility
├── 📄 README.md                # Main project documentation
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 wrangler.toml            # Cloudflare Workers config
└── 📄 .env.example             # Environment variables template
```

## 🔧 Key Components

### **Entry Point** (`src/index.ts`)
- Main Cloudflare Workers handler
- Route management (admin, webhook, health)
- Service initialization and error handling
- Clean, focused implementation (265 lines)

### **Bot Logic** (`src/bot/leitner-bot.ts`)
- Complete Telegram bot implementation
- Leitner spaced repetition system
- Multi-language conversation handling
- Command processing and inline keyboards

### **Services Layer**
- **UserManager**: User data and progress tracking
- **WordExtractor**: AI-powered vocabulary extraction
- **ScheduleManager**: Spaced repetition scheduling
- **AdminService**: Admin authentication and management
- **LanguageManager**: Multi-language support (19+ languages)
- **Logger**: Structured logging with Analytics Engine
- **HealthCheck**: System monitoring and API health checks

### **Admin Panel**
- Full-featured web interface
- User management and statistics
- AI-powered bulk word processing
- Messaging system and support tickets
- Real-time monitoring dashboard

## 🚀 Build System

- **TypeScript**: Strict type checking and modern ES features
- **Cloudflare Workers**: Serverless deployment platform
- **KV Storage**: Persistent data storage
- **Analytics Engine**: Performance monitoring
- **Google Gemini AI**: Intelligent word processing

## 📊 Quality Improvements

- ✅ **Removed 35+ empty/unused files**
- ✅ **Separated HTML from TypeScript logic**
- ✅ **Implemented missing core services**
- ✅ **Enhanced error handling and logging**
- ✅ **Organized documentation structure**
- ✅ **Clean separation of concerns**
- ✅ **Comprehensive type safety**