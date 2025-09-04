# Cloudflare Workers Logging & Monitoring Guide

## Overview
This guide covers comprehensive logging, monitoring, and debugging for the Leitner Telegram Bot deployed on Cloudflare Workers.

## 🔍 Available Logging Features

### 1. Real-time Logs
```powershell
# View live logs with pretty formatting
npm run logs:live

# View raw logs
npm run logs

# Search logs for specific terms
npm run logs:search "ERROR"
npm run logs:search "vocabulary"
```

### 2. Analytics Engine Integration
- **Structured Events**: All major bot events are logged to Analytics Engine
- **Performance Metrics**: Request duration, error rates, command processing times
- **User Activity**: Command usage, vocabulary extraction success/failure rates
- **System Health**: Service uptime, API response times

### 3. Debug Endpoints

#### Health Check
```
GET https://leitner-telegram-bot.t-ak-sa.workers.dev/health
```
Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": {
    "botTokenSet": true,
    "geminiKeySet": true,
    "kvSet": true
  }
}
```

#### Debug Information
```
GET https://leitner-telegram-bot.t-ak-sa.workers.dev/debug
```
Returns detailed environment and request information.

## 📊 Monitoring Dashboard

### Key Metrics Tracked
1. **Request Metrics**
   - Requests per minute
   - Response times
   - Error rates (4xx, 5xx)

2. **Bot Activity**
   - Commands processed
   - Words extracted
   - Daily reminders sent
   - Active conversations

3. **System Health**
   - Service uptime
   - KV operation success
   - Gemini API status
   - Memory usage

### Setting Up Alerts
Configure alerts in the Cloudflare Dashboard:
1. Go to Workers & Pages > Analytics
2. Set up custom alerts for:
   - Error rate > 5%
   - Response time > 5 seconds
   - Vocabulary extraction failures

## 🛠️ Debugging Commands

### Local Development with Enhanced Logging
```powershell
# Start development server with debug logging
npm run debug

# Build and check for errors
npm run build

# Deploy with logging enabled
npm run deploy
```

### Production Debugging

#### View Recent Logs
```powershell
# Last 100 log entries
wrangler tail --format=pretty

# Filter for errors only
wrangler tail --format=pretty | Select-String "ERROR"

# Search for specific user issues
wrangler tail --search "user_id:12345"
```

#### Analytics Queries
```powershell
# View analytics data
wrangler analytics

# Custom queries (if configured)
wrangler analytics --query="SELECT * FROM events WHERE eventType='VOCABULARY_EXTRACTION_ERROR'"
```

## 📈 Performance Monitoring

### Request Tracking
Every request logs:
- Start time and duration
- HTTP method and path
- User agent and CF data
- Response status
- Error details (if any)

### Error Tracking
Enhanced error logging includes:
- Full error messages
- Stack traces
- Request context
- User information
- Timestamp and duration

### Vocabulary Extraction Monitoring
Specific tracking for AI operations:
- Gemini API call success/failure
- Response parsing errors
- Token usage (if applicable)
- Processing time

## 🚨 Common Issues & Debugging

### Issue: Bot Not Responding
1. Check health endpoint
2. Verify environment variables
3. Check recent error logs:
   ```powershell
   npm run logs:search "ERROR"
   ```

### Issue: Vocabulary Extraction Failing
1. Check Gemini API status
2. Look for extraction errors:
   ```powershell
   npm run logs:search "vocabulary.*extraction.*error"
   ```
3. Verify API key is set correctly

### Issue: High Response Times
1. Monitor performance metrics
2. Check KV operation times
3. Review API call latencies:
   ```powershell
   npm run logs:search "REQUEST_COMPLETE"
   ```

## 📋 Log Event Types

### Standard Events
- `REQUEST_START`: Incoming request received
- `REQUEST_COMPLETE`: Request processed successfully
- `REQUEST_ERROR`: Request failed with error
- `WEBHOOK_RECEIVED`: Telegram webhook received
- `COMMAND_PROCESSED`: Bot command handled
- `VOCABULARY_EXTRACTED`: Words extracted successfully
- `VOCABULARY_EXTRACTION_ERROR`: Extraction failed
- `DAILY_REMINDER_SENT`: Scheduled reminder sent
- `CRON_TRIGGERED`: Scheduled task started
- `SCHEDULED_COMPLETE`: Scheduled task completed
- `SCHEDULED_ERROR`: Scheduled task failed

### Error Events
All errors include:
- Error message
- Stack trace (when available)
- Request context
- Timestamp
- User information (when available)

## 🔧 Configuration Files

### wrangler.toml
Enhanced with logging features:
- `observability` enabled
- `logpush` configured
- `tail` settings optimized
- Analytics Engine datasets

### monitoring/dashboard-config.json
Dashboard configuration for:
- Custom widgets
- Alert rules
- Log queries
- Performance thresholds

## 📚 Advanced Features

### Custom Analytics
Use the Analytics Engine dataset for:
- Custom performance dashboards
- User behavior analysis
- Error pattern detection
- Cost optimization insights

### Log Retention
- Live logs: Available in real-time
- Analytics data: Retained based on plan
- Structured events: Queryable for analysis

### Integration Options
- Export logs to external systems
- Set up Slack/Discord notifications
- Create custom alerting rules
- Build performance dashboards

## 🎯 Best Practices

1. **Structured Logging**: All events use consistent JSON format
2. **Error Context**: Include full context in error logs
3. **Performance Tracking**: Monitor critical path operations
4. **User Privacy**: Avoid logging sensitive user data
5. **Cost Management**: Monitor Analytics Engine usage
6. **Alerting**: Set up proactive monitoring for critical issues

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run logs` | View real-time logs |
| `npm run logs:live` | Pretty formatted logs |
| `npm run health` | Check service status |
| `npm run debug` | Local dev with debug logs |
| `npm run analytics` | View analytics data |

This comprehensive logging setup provides full visibility into your bot's operation, helping you quickly identify and resolve issues while monitoring performance and user engagement.
