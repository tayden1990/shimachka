# Test if the bot can send messages
$botToken = "8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks"
$userId = 235552633  # Use the real user ID from the system

Write-Host "=== TESTING BOT MESSAGE SENDING ===" -ForegroundColor Green

# 1. Test sending a direct message to a user
Write-Host "`n1. Testing direct message sending..." -ForegroundColor Yellow
try {
    $messageResponse = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/sendMessage" -Method Post -Body (@{
        chat_id = $userId
        text = "🧪 Test message from bot - if you receive this, the bot can send messages!"
    } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "Message sent successfully!" -ForegroundColor Green
    Write-Host "Message ID: $($messageResponse.result.message_id)" -ForegroundColor White
} catch {
    Write-Host "Failed to send message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details: $errorBody" -ForegroundColor Red
    }
}

# 2. Check bot info
Write-Host "`n2. Checking bot information..." -ForegroundColor Yellow
try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getMe" -Method Get
    Write-Host "Bot Username: @$($botInfo.result.username)" -ForegroundColor Green
    Write-Host "Bot Name: $($botInfo.result.first_name)" -ForegroundColor White
    Write-Host "Bot ID: $($botInfo.result.id)" -ForegroundColor White
    Write-Host "Can Join Groups: $($botInfo.result.can_join_groups)" -ForegroundColor White
    Write-Host "Can Read All Group Messages: $($botInfo.result.can_read_all_group_messages)" -ForegroundColor White
} catch {
    Write-Host "Failed to get bot info: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test webhook with actual /start command simulation
Write-Host "`n3. Simulating /start command via webhook..." -ForegroundColor Yellow
$webhookPayload = @{
    update_id = [int](Get-Date -UFormat %s)
    message = @{
        message_id = [int](Get-Date -UFormat %s)
        date = [int][double]::Parse((Get-Date -UFormat %s))
        chat = @{
            id = $userId
            type = "private"
            first_name = "Test"
            username = "Arsham2023v"
        }
        from = @{
            id = $userId
            is_bot = $false
            first_name = "Test"
            username = "Arsham2023v"
        }
        text = "/start"
    }
} | ConvertTo-Json -Depth 10

try {
    $webhookResponse = Invoke-WebRequest -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/webhook" -Method Post -Body $webhookPayload -ContentType "application/json" -TimeoutSec 15
    Write-Host "Webhook processed /start command successfully!" -ForegroundColor Green
    Write-Host "Response Status: $($webhookResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "Webhook processing failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== INSTRUCTIONS ===" -ForegroundColor Green
Write-Host "1. If direct message test succeeded, the bot token is working"
Write-Host "2. Check Telegram to see if you received the test message"
Write-Host "3. Try sending /start to @$($botInfo.result.username) again"
Write-Host "4. If bot still doesn't respond, there might be an issue in the /start handler"
