# Test webhook directly to see if it's receiving and processing messages
$botToken = "8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks"

Write-Host "=== WEBHOOK TROUBLESHOOTING ===" -ForegroundColor Green

# 1. Check webhook status
Write-Host "`n1. Current webhook status..." -ForegroundColor Yellow
$webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
Write-Host "Webhook URL: $($webhookInfo.result.url)" -ForegroundColor White
Write-Host "Pending Updates: $($webhookInfo.result.pending_update_count)" -ForegroundColor White
if ($webhookInfo.result.last_error_message) {
    Write-Host "Last Error: $($webhookInfo.result.last_error_message)" -ForegroundColor Red
    Write-Host "Last Error Date: $($webhookInfo.result.last_error_date)" -ForegroundColor Red
} else {
    Write-Host "No webhook errors" -ForegroundColor Green
}

# 2. Test webhook endpoint directly
Write-Host "`n2. Testing webhook endpoint..." -ForegroundColor Yellow
$testPayload = @{
    update_id = 999999999
    message = @{
        message_id = 999
        date = [int][double]::Parse((Get-Date -UFormat %s))
        chat = @{
            id = 235552633  # Use real user ID from your system
            type = "private"
        }
        from = @{
            id = 235552633
            is_bot = $false
            first_name = "arsham"
            username = "Arsham2023v"
        }
        text = "/start"
    }
} | ConvertTo-Json -Depth 10

try {
    $webhookResponse = Invoke-WebRequest -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/webhook" -Method Post -Body $testPayload -ContentType "application/json" -Headers @{"X-Telegram-Bot-Api-Secret-Token"="your_webhook_secret_here"} -TimeoutSec 30
    Write-Host "Webhook Response Status: $($webhookResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Webhook Response: $($webhookResponse.Content)" -ForegroundColor White
} catch {
    Write-Host "Webhook Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}

# 3. Check for recent updates
Write-Host "`n3. Checking for pending updates..." -ForegroundColor Yellow
try {
    $updatesResponse = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getUpdates?limit=5&offset=-5" -Method Get
    Write-Host "Recent updates count: $($updatesResponse.result.Count)" -ForegroundColor White
    if ($updatesResponse.result.Count -gt 0) {
        Write-Host "Most recent update:" -ForegroundColor Green
        $updatesResponse.result[-1] | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "Failed to get updates: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. If webhook test shows 200 OK, the webhook is working"
Write-Host "2. If there are pending updates, the bot might be processing them"
Write-Host "3. Try sending /start to @LeitnerSystemBot in Telegram"
Write-Host "4. Check that the bot username is correct and active"
