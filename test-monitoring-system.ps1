# Comprehensive System Monitoring and Testing Script
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== COMPREHENSIVE SYSTEM MONITORING ===" -ForegroundColor Green
Write-Host "Testing enhanced logging and monitoring system..." -ForegroundColor White

# 1. Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   Timestamp: $($healthResponse.timestamp)" -ForegroundColor White
    Write-Host "   Version: $($healthResponse.version)" -ForegroundColor White
    Write-Host "   Bot Token: $($healthResponse.environment.botTokenSet)" -ForegroundColor White
    Write-Host "   Gemini API: $($healthResponse.environment.geminiKeySet)" -ForegroundColor White
    Write-Host "   KV Database: $($healthResponse.environment.kvSet)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test Admin Health Check
Write-Host "`n2. Testing Admin Health Check..." -ForegroundColor Yellow
try {
    $adminHealthResponse = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Method Get -Headers $authHeader
    Write-Host "✅ Admin Health Status Retrieved" -ForegroundColor Green
    $adminHealthResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Admin Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test Logs Endpoint
Write-Host "`n3. Testing Logs Endpoint..." -ForegroundColor Yellow
try {
    $logsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/logs?limit=10" -Method Get -Headers $authHeader
    Write-Host "✅ Recent Logs Retrieved (showing last 10):" -ForegroundColor Green
    $logsResponse.logs | ForEach-Object {
        $timeFormatted = ([DateTime]$_.timestamp).ToString("HH:mm:ss")
        $levelColor = switch($_.level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "INFO" { "Green" }
            "DEBUG" { "Cyan" }
            default { "White" }
        }
        Write-Host "   [$timeFormatted] $($_.level): $($_.message)" -ForegroundColor $levelColor
    }
} catch {
    Write-Host "❌ Logs Retrieval Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Metrics Endpoint
Write-Host "`n4. Testing Metrics Endpoint..." -ForegroundColor Yellow
try {
    $metricsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/metrics" -Method Get -Headers $authHeader
    Write-Host "✅ System Metrics Retrieved:" -ForegroundColor Green
    Write-Host "   Request Count: $($metricsResponse.requestCount)" -ForegroundColor White
    Write-Host "   Error Count: $($metricsResponse.errorCount)" -ForegroundColor White
    Write-Host "   Average Response Time: $($metricsResponse.averageResponseTime)ms" -ForegroundColor White
    Write-Host "   Uptime: $($metricsResponse.uptime)" -ForegroundColor White
} catch {
    Write-Host "❌ Metrics Retrieval Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test AI Bulk Words with Enhanced Logging
Write-Host "`n5. Testing AI Bulk Words with Enhanced Logging..." -ForegroundColor Yellow
$testWords = @{
    words = "debugging,monitoring,logging"
    meaningLanguage = "English"
    definitionLanguage = "English"
    assignUsers = @()
} | ConvertTo-Json

try {
    Write-Host "   Submitting bulk words request..." -ForegroundColor Cyan
    $bulkResponse = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $testWords -ContentType "application/json" -Headers $authHeader
    Write-Host "✅ Bulk Processing Started:" -ForegroundColor Green
    Write-Host "   Job ID: $($bulkResponse.jobId)" -ForegroundColor White
    Write-Host "   Status: $($bulkResponse.status)" -ForegroundColor White
    Write-Host "   Total Words: $($bulkResponse.totalWords)" -ForegroundColor White
    
    # Wait a bit and check progress
    Write-Host "   Waiting for processing..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    $progressResponse = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$($bulkResponse.jobId)" -Method Get -Headers $authHeader
    Write-Host "✅ Job Progress:" -ForegroundColor Green
    Write-Host "   Status: $($progressResponse.status)" -ForegroundColor White
    Write-Host "   Processed: $($progressResponse.processedWords)/$($progressResponse.totalWords)" -ForegroundColor White
    Write-Host "   Success: $($progressResponse.successCount)" -ForegroundColor White
    Write-Host "   Errors: $($progressResponse.errorCount)" -ForegroundColor White
    
    if ($progressResponse.logs -and $progressResponse.logs.Count -gt 0) {
        Write-Host "   Recent Logs:" -ForegroundColor Green
        $progressResponse.logs | Select-Object -Last 5 | ForEach-Object {
            Write-Host "     • $_" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ AI Bulk Words Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test Users Endpoint
Write-Host "`n6. Testing Users Management..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $authHeader
    Write-Host "✅ Users Retrieved:" -ForegroundColor Green
    Write-Host "   Total Users: $($usersResponse.total)" -ForegroundColor White
    Write-Host "   Page: $($usersResponse.page)" -ForegroundColor White
    Write-Host "   Active Users: $(($usersResponse.users | Where-Object { $_.isActive }).Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Users Retrieval Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Test Webhook Functionality
Write-Host "`n7. Testing Webhook Processing..." -ForegroundColor Yellow
$webhookPayload = @{
    update_id = [int](Get-Date -UFormat %s)
    message = @{
        message_id = [int](Get-Date -UFormat %s)
        date = [int][double]::Parse((Get-Date -UFormat %s))
        chat = @{
            id = 235552633
            type = "private"
        }
        from = @{
            id = 235552633
            is_bot = $false
            first_name = "Test"
            username = "testuser"
        }
        text = "/start"
    }
} | ConvertTo-Json -Depth 10

try {
    $webhookResponse = Invoke-WebRequest -Uri "$baseUrl/webhook" -Method Post -Body $webhookPayload -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Webhook Test Successful:" -ForegroundColor Green
    Write-Host "   Status Code: $($webhookResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Webhook Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Summary
Write-Host "`n=== MONITORING SUMMARY ===" -ForegroundColor Green
Write-Host "✅ Health Check: Available at $baseUrl/health" -ForegroundColor White
Write-Host "✅ Admin Health: Available at $baseUrl/admin/health" -ForegroundColor White
Write-Host "✅ Live Logs: Available at $baseUrl/admin/logs" -ForegroundColor White
Write-Host "✅ Metrics: Available at $baseUrl/admin/metrics" -ForegroundColor White
Write-Host "✅ Admin Panel: Enhanced with monitoring dashboard" -ForegroundColor White

Write-Host "`n🎯 To view the monitoring dashboard:" -ForegroundColor Yellow
Write-Host "   Open: $baseUrl/admin" -ForegroundColor Cyan
Write-Host "   Login with admin credentials" -ForegroundColor Cyan
Write-Host "   Navigate to the 'System Monitoring' section" -ForegroundColor Cyan
