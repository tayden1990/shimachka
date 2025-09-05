# Setup Telegram Webhook for Leitner Bot
# This script sets up the webhook for the Telegram bot to receive messages

# Get bot token from Cloudflare secrets or prompt user
$BOT_TOKEN = Read-Host "Enter your Telegram Bot Token"

if (-not $BOT_TOKEN) {
    Write-Host "Bot token is required!" -ForegroundColor Red
    exit 1
}

# Set webhook URL
$WEBHOOK_URL = "https://leitner-telegram-bot.t-ak-sa.workers.dev/webhook"

Write-Host "Setting up webhook..." -ForegroundColor Yellow
Write-Host "Bot Token: $($BOT_TOKEN.Substring(0,10))..." -ForegroundColor Gray
Write-Host "Webhook URL: $WEBHOOK_URL" -ForegroundColor Gray

try {
    # Set the webhook
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" -Method POST -ContentType "application/json" -Body (@{
        url = $WEBHOOK_URL
    } | ConvertTo-Json)
    
    if ($response.ok) {
        Write-Host "✅ Webhook set successfully!" -ForegroundColor Green
        Write-Host "Description: $($response.description)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to set webhook" -ForegroundColor Red
        Write-Host "Error: $($response.description)" -ForegroundColor Red
    }
    
    # Check webhook info
    Write-Host "`nChecking webhook info..." -ForegroundColor Yellow
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" -Method GET
    
    Write-Host "Current webhook URL: $($webhookInfo.result.url)" -ForegroundColor Gray
    Write-Host "Pending updates: $($webhookInfo.result.pending_update_count)" -ForegroundColor Gray
    if ($webhookInfo.result.last_error_message) {
        Write-Host "Last error: $($webhookInfo.result.last_error_message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error setting webhook: $_" -ForegroundColor Red
}

Write-Host "`n🎯 Your bot should now be ready to receive messages!" -ForegroundColor Green
Write-Host "Try sending /start to your bot in Telegram." -ForegroundColor Cyan
