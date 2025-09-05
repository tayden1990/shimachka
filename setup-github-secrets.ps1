# GitHub Secrets Setup Helper
# Copy these values to your GitHub repository secrets

Write-Host "=== GITHUB SECRETS SETUP ===" -ForegroundColor Green
Write-Host ""

# Read values from .env
$envContent = Get-Content .env -ErrorAction SilentlyContinue
if ($envContent) {
    $botToken = ($envContent | Where-Object { $_ -match "TELEGRAM_BOT_TOKEN=" }) -replace "TELEGRAM_BOT_TOKEN=", ""
    $geminiKey = ($envContent | Where-Object { $_ -match "GEMINI_API_KEY=" }) -replace "GEMINI_API_KEY=", ""
    $webhookSecret = ($envContent | Where-Object { $_ -match "WEBHOOK_SECRET=" }) -replace "WEBHOOK_SECRET=", ""
    
    Write-Host "1. TELEGRAM_BOT_TOKEN:" -ForegroundColor Yellow
    Write-Host "   $botToken" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. WEBHOOK_SECRET:" -ForegroundColor Yellow  
    Write-Host "   $webhookSecret" -ForegroundColor White
    Write-Host ""
}

Write-Host "3. Get your CLOUDFLARE_ACCOUNT_ID by running:" -ForegroundColor Yellow
Write-Host "   npx wrangler whoami" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Get your CLOUDFLARE_API_TOKEN from:" -ForegroundColor Yellow
Write-Host "   https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
Write-Host "   (Use 'Edit Cloudflare Workers' template)" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Your worker URL will be:" -ForegroundColor Yellow
Write-Host "   https://leitner-telegram-bot.t-ak-sa.workers.dev" -ForegroundColor White
Write-Host ""

Write-Host "=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. Go to your GitHub repo → Settings → Secrets and variables → Actions"
Write-Host "2. Add the above values as repository secrets"
Write-Host "3. Push code to main branch to trigger automatic deployment"
Write-Host "4. Your bot will be automatically deployed and activated!"
Write-Host ""

# Test current webhook status
if ($botToken) {
    Write-Host "=== CURRENT WEBHOOK STATUS ===" -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
        Write-Host "Webhook URL: $($response.result.url)" -ForegroundColor White
        Write-Host "Has Secret: $($response.result.has_secret_token)" -ForegroundColor White
        Write-Host "Pending Updates: $($response.result.pending_update_count)" -ForegroundColor White
        
        if ($response.result.last_error_message) {
            Write-Host "Last Error: $($response.result.last_error_message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Could not get webhook info. Check bot token." -ForegroundColor Red
    }
}
