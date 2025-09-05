# Script to set up Telegram webhook for the deployed bot
# Replace these values with your actual ones:

# Get these from your .env file
$BOT_TOKEN = Get-Content .env | Where-Object { $_ -match "TELEGRAM_BOT_TOKEN=" } | ForEach-Object { $_.Split("=")[1] }
$WEBHOOK_SECRET = Get-Content .env | Where-Object { $_ -match "WEBHOOK_SECRET=" } | ForEach-Object { $_.Split("=")[1] }

# You need to replace this with your actual Cloudflare Workers URL
# It should look like: https://leitner-telegram-bot.YOUR-SUBDOMAIN.workers.dev
$WORKER_URL = "https://leitner-telegram-bot.YOUR-SUBDOMAIN.workers.dev"

Write-Host "Setting up Telegram webhook..."
Write-Host "Bot Token: $($BOT_TOKEN.Substring(0,10))..."
Write-Host "Worker URL: $WORKER_URL"

# Set the webhook
$webhookUrl = "https://api.telegram.org/bot$BOT_TOKEN/setWebhook"
$body = @{
    url = "$WORKER_URL/webhook"
    secret_token = $WEBHOOK_SECRET
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
Write-Host "Webhook setup response: $($response | ConvertTo-Json)"

# Check webhook info
$infoUrl = "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
$info = Invoke-RestMethod -Uri $infoUrl -Method Get
Write-Host "Current webhook info: $($info | ConvertTo-Json)"
