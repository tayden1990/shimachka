# Test Telegram Bot Webhook
$botToken = "8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks"

Write-Host "=== BOT TROUBLESHOOTING ===" -ForegroundColor Green

# 1. Check webhook info
Write-Host "`n1. Checking webhook status..." -ForegroundColor Yellow
$webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
Write-Host "Webhook URL: $($webhookInfo.result.url)" -ForegroundColor White
Write-Host "Pending Updates: $($webhookInfo.result.pending_update_count)" -ForegroundColor White
if ($webhookInfo.result.last_error_message) {
    Write-Host "Last Error: $($webhookInfo.result.last_error_message)" -ForegroundColor Red
} else {
    Write-Host "No errors reported" -ForegroundColor Green
}

# 2. Test worker health
Write-Host "`n2. Testing worker health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/health" -Method Get -TimeoutSec 10
    Write-Host "Worker Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    $healthContent = $healthResponse.Content | ConvertFrom-Json
    Write-Host "Worker Response: $($healthContent | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "Worker Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test webhook endpoint
Write-Host "`n3. Testing webhook endpoint..." -ForegroundColor Yellow
try {
    $testPayload = @{
        update_id = 123456789
        message = @{
            message_id = 1
            date = [int][double]::Parse((Get-Date -UFormat %s))
            chat = @{
                id = 123456789
                type = "private"
            }
            from = @{
                id = 123456789
                is_bot = $false
                first_name = "Test"
                username = "testuser"
            }
            text = "/start"
        }
    } | ConvertTo-Json -Depth 10

    $webhookResponse = Invoke-WebRequest -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/webhook" -Method Post -Body $testPayload -ContentType "application/json" -TimeoutSec 10
    Write-Host "Webhook Response: $($webhookResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Webhook Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get bot info
Write-Host "`n4. Checking bot info..." -ForegroundColor Yellow
try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getMe" -Method Get
    Write-Host "Bot Username: @$($botInfo.result.username)" -ForegroundColor Green
    Write-Host "Bot ID: $($botInfo.result.id)" -ForegroundColor White
} catch {
    Write-Host "Failed to get bot info: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== INSTRUCTIONS ===" -ForegroundColor Green
Write-Host "If webhook test fails, the issue is in your deployed code."
Write-Host "If webhook test succeeds but bot doesn't respond, check Cloudflare Workers logs."
Write-Host "Try sending /start to @$($botInfo.result.username) in Telegram."
