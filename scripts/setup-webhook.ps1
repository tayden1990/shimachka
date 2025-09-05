# Telegram Webhook Setup Script for PowerShell
# Automatically configures the webhook after deployment

param(
    [string]$Action = "setup",
    [string]$WorkerUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev",
    [string]$BotToken = $env:TELEGRAM_BOT_TOKEN
)

$WEBHOOK_PATH = "/webhook"
$TELEGRAM_API_BASE = "https://api.telegram.org/bot"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $colors = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Blue
        "Cyan" = [ConsoleColor]::Cyan
        "White" = [ConsoleColor]::White
    }
    
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Test-BotToken {
    param([string]$Token)
    
    if (-not $Token) {
        Write-ColorOutput "❌ TELEGRAM_BOT_TOKEN is required" "Red"
        Write-ColorOutput "💡 Set it with: wrangler secret put TELEGRAM_BOT_TOKEN" "Yellow"
        return $false
    }
    
    if ($Token.Length -lt 20) {
        Write-ColorOutput "❌ Invalid bot token format" "Red"
        return $false
    }
    
    return $true
}

function Invoke-TelegramAPI {
    param(
        [string]$Method,
        [string]$Token,
        [hashtable]$Body = @{}
    )
    
    $uri = "$TELEGRAM_API_BASE$Token/$Method"
    
    try {
        if ($Body.Count -gt 0) {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Body ($Body | ConvertTo-Json) -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method Get
        }
        return $response
    } catch {
        throw "API call failed: $($_.Exception.Message)"
    }
}

function Test-WorkerEndpoint {
    param([string]$Url)
    
    try {
        $healthUrl = $Url.Replace("/webhook", "/health")
        $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Setup-Webhook {
    Write-ColorOutput "🚀 Setting up Telegram webhook..." "Cyan"
    Write-Host ""
    
    # Validate inputs
    if (-not (Test-BotToken $BotToken)) {
        exit 1
    }
    
    $webhookUrl = "$($WorkerUrl.TrimEnd('/'))$WEBHOOK_PATH"
    
    Write-ColorOutput "📡 Worker URL: $WorkerUrl" "Blue"
    Write-ColorOutput "🔗 Webhook URL: $webhookUrl" "Blue"
    Write-ColorOutput "🤖 Bot Token: $($BotToken.Substring(0, 10))..." "Blue"
    Write-Host ""
    
    try {
        # Step 1: Test worker endpoint
        Write-ColorOutput "1️⃣  Testing worker endpoint..." "Yellow"
        $isAccessible = Test-WorkerEndpoint $webhookUrl
        if (-not $isAccessible) {
            Write-ColorOutput "⚠️  Warning: Worker endpoint may not be ready yet" "Yellow"
            Write-ColorOutput "   This is normal for fresh deployments. Continuing..." "Yellow"
        } else {
            Write-ColorOutput "✅ Worker endpoint is accessible" "Green"
        }
        Write-Host ""
        
        # Step 2: Get current webhook info
        Write-ColorOutput "2️⃣  Getting current webhook information..." "Yellow"
        $currentInfo = Invoke-TelegramAPI -Method "getWebhookInfo" -Token $BotToken
        
        if ($currentInfo.ok) {
            $webhook = $currentInfo.result
            Write-ColorOutput "   Current webhook URL: $($webhook.url -or 'None')" "White"
            Write-ColorOutput "   Pending updates: $($webhook.pending_update_count -or 0)" "White"
            
            if ($webhook.last_error_message) {
                Write-ColorOutput "   Last error: $($webhook.last_error_message)" "Yellow"
            }
            
            # Check if already configured
            if ($webhook.url -eq $webhookUrl) {
                Write-ColorOutput "✅ Webhook is already configured correctly!" "Green"
                Write-ColorOutput "🎉 Setup complete!" "Green"
                return
            }
        }
        Write-Host ""
        
        # Step 3: Set new webhook
        Write-ColorOutput "3️⃣  Setting new webhook..." "Yellow"
        $webhookBody = @{
            url = $webhookUrl
            allowed_updates = @("message", "callback_query", "inline_query", "chosen_inline_result")
            drop_pending_updates = $false
        }
        
        $setResult = Invoke-TelegramAPI -Method "setWebhook" -Token $BotToken -Body $webhookBody
        
        if ($setResult.ok) {
            Write-ColorOutput "✅ Webhook set successfully!" "Green"
        } else {
            throw "Failed to set webhook: $($setResult.description)"
        }
        
        # Step 4: Verify webhook
        Write-ColorOutput "4️⃣  Verifying webhook configuration..." "Yellow"
        $verifyInfo = Invoke-TelegramAPI -Method "getWebhookInfo" -Token $BotToken
        
        if ($verifyInfo.ok -and $verifyInfo.result.url -eq $webhookUrl) {
            Write-ColorOutput "✅ Webhook verification successful!" "Green"
            Write-ColorOutput "   ✓ URL: $($verifyInfo.result.url)" "Green"
            Write-ColorOutput "   ✓ Allowed updates: $($verifyInfo.result.allowed_updates -join ', ')" "Green"
            Write-Host ""
            Write-ColorOutput "🎉 Webhook setup complete!" "Green"
            Write-Host ""
            Write-ColorOutput "📱 Your bot is now ready to receive messages!" "Cyan"
        } else {
            throw "Webhook URL verification failed"
        }
        
    } catch {
        Write-ColorOutput "❌ Error: $($_.Exception.Message)" "Red"
        Write-Host ""
        Write-ColorOutput "🔧 Troubleshooting steps:" "Yellow"
        Write-ColorOutput "1. Check that TELEGRAM_BOT_TOKEN is correctly set" "White"
        Write-ColorOutput "2. Verify the worker URL is accessible" "White"
        Write-ColorOutput "3. Ensure the bot token is valid" "White"
        Write-ColorOutput "4. Try running: wrangler secret put TELEGRAM_BOT_TOKEN" "White"
        exit 1
    }
}

function Remove-Webhook {
    Write-ColorOutput "🧹 Removing Telegram webhook..." "Cyan"
    Write-Host ""
    
    if (-not (Test-BotToken $BotToken)) {
        exit 1
    }
    
    try {
        $deleteBody = @{
            drop_pending_updates = $false
        }
        
        $result = Invoke-TelegramAPI -Method "deleteWebhook" -Token $BotToken -Body $deleteBody
        
        if ($result.ok) {
            Write-ColorOutput "✅ Webhook removed successfully!" "Green"
            Write-ColorOutput "🤖 Bot is now using polling mode (if applicable)" "Blue"
        } else {
            throw "Failed to remove webhook: $($result.description)"
        }
    } catch {
        Write-ColorOutput "❌ Error: $($_.Exception.Message)" "Red"
        exit 1
    }
}

# Main execution
switch ($Action.ToLower()) {
    "setup" { Setup-Webhook }
    "remove" { Remove-Webhook }
    "delete" { Remove-Webhook }
    default {
        Write-ColorOutput "Usage: .\setup-webhook.ps1 [-Action setup|remove] [-WorkerUrl <url>] [-BotToken <token>]" "Yellow"
        Write-ColorOutput "  -Action setup  - Configure the webhook (default)" "White"
        Write-ColorOutput "  -Action remove - Remove the webhook" "White"
        Write-ColorOutput "  -WorkerUrl     - Your Cloudflare Worker URL" "White"
        Write-ColorOutput "  -BotToken      - Telegram bot token (or use env var)" "White"
        exit 1
    }
}
