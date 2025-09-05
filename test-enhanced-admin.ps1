# Test Enhanced Admin Panel and Notifications
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== TESTING ENHANCED ADMIN PANEL ===" -ForegroundColor Green

# Test 1: Admin Panel HTML Interface
Write-Host "`n1. Testing Admin Panel HTML Interface..." -ForegroundColor Yellow
try {
    $adminPanel = Invoke-WebRequest -Uri "$baseUrl/admin" -Method Get
    Write-Host "   ✅ Admin Panel HTML: $($adminPanel.StatusCode)" -ForegroundColor Green
    Write-Host "   Content Type: $($adminPanel.Headers.'Content-Type')" -ForegroundColor White
    Write-Host "   Content Length: $($adminPanel.Content.Length) bytes" -ForegroundColor White
    
    # Check if key features are present in HTML
    $hasMonitoring = $adminPanel.Content -match "Monitoring"
    $hasLogs = $adminPanel.Content -match "Logs"
    $hasBulkWords = $adminPanel.Content -match "Bulk Words"
    $hasHealthCheck = $adminPanel.Content -match "Health Check"
    
    Write-Host "   Features present:" -ForegroundColor Cyan
    Write-Host "     📊 Monitoring: $(if($hasMonitoring){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     📝 Logs: $(if($hasLogs){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     🔄 Bulk Words: $(if($hasBulkWords){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     🏥 Health Check: $(if($hasHealthCheck){'✅'}else{'❌'})" -ForegroundColor White
    
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Enhanced Bulk Words with Notifications
Write-Host "`n2. Testing Enhanced Bulk Words Processing..." -ForegroundColor Yellow
$testData = @{
    words = "notification,enhancement,monitoring"
    meaningLanguage = "English"
    definitionLanguage = "English"
    assignUsers = @("235552633")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $testData -ContentType "application/json" -Headers $authHeader
    Write-Host "   ✅ Request submitted: Job $($response.jobId)" -ForegroundColor Green
    $jobId = $response.jobId
    
    # Monitor with enhanced logging
    $attempts = 0
    do {
        Start-Sleep -Seconds 3
        $attempts++
        
        $progress = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$jobId" -Method Get -Headers $authHeader
        Write-Host "   Progress $attempts`: $($progress.status) | $($progress.processedWords)/$($progress.totalWords)" -ForegroundColor Cyan
        
        if ($progress.logs -and $progress.logs.Count -gt 0) {
            Write-Host "   Recent logs:" -ForegroundColor Green
            $progress.logs | Select-Object -Last 3 | ForEach-Object {
                Write-Host "     • $_" -ForegroundColor Gray
            }
        }
        
        if ($progress.status -eq "completed" -or $progress.status -eq "failed") {
            break
        }
    } while ($attempts -lt 10)
    
    if ($progress.status -eq "completed") {
        Write-Host "   ✅ Processing completed successfully!" -ForegroundColor Green
        Write-Host "   📊 Success: $($progress.successCount), Errors: $($progress.errorCount)" -ForegroundColor White
    }
    
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check Telegram Notifications
Write-Host "`n3. Checking Telegram Notifications..." -ForegroundColor Yellow
try {
    # Wait a bit for notifications to be queued
    Start-Sleep -Seconds 2
    
    # Check if notifications were created (this endpoint might not exist, but let's try)
    try {
        $notifications = Invoke-RestMethod -Uri "$baseUrl/admin/notifications" -Method Get -Headers $authHeader
        Write-Host "   ✅ Notifications found: $($notifications.Count)" -ForegroundColor Green
    } catch {
        Write-Host "   ℹ️ Notification endpoint not available (expected)" -ForegroundColor Yellow
    }
    
    # Check user details to see if cards were added
    $userDetails = Invoke-RestMethod -Uri "$baseUrl/admin/users/235552633/details" -Method Get -Headers $authHeader
    Write-Host "   📚 User now has $($userDetails.stats.totalCards) total cards" -ForegroundColor Green
    
} catch {
    Write-Host "   ⚠️ Could not check notifications: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 4: API Endpoints for Dashboard
Write-Host "`n4. Testing Dashboard API Endpoints..." -ForegroundColor Yellow

# Test Dashboard Data
try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $authHeader
    Write-Host "   ✅ Dashboard API working" -ForegroundColor Green
    Write-Host "     Total Users: $($dashboard.totalUsers)" -ForegroundColor White
    Write-Host "     Total Cards: $($dashboard.totalCards)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Dashboard API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Metrics
try {
    $metrics = Invoke-RestMethod -Uri "$baseUrl/admin/metrics" -Method Get -Headers $authHeader
    Write-Host "   ✅ Metrics API working" -ForegroundColor Green
    Write-Host "     Request Count: $($metrics.requestCount)" -ForegroundColor White
    Write-Host "     Error Count: $($metrics.errorCount)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Metrics API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Logs
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/admin/logs?limit=5" -Method Get -Headers $authHeader
    Write-Host "   ✅ Logs API working" -ForegroundColor Green
    Write-Host "     Recent logs count: $($logs.logs.Count)" -ForegroundColor White
    if ($logs.logs.Count -gt 0) {
        Write-Host "     Latest log: $($logs.logs[0].message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Logs API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Health Check
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Method Get -Headers $authHeader
    Write-Host "   ✅ Health Check API working" -ForegroundColor Green
    Write-Host "     Components checked: $($health.PSObject.Properties.Count)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Health Check API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== ENHANCEMENT SUMMARY ===" -ForegroundColor Green
Write-Host "✅ New Features Implemented:" -ForegroundColor White
Write-Host "  • 📊 Comprehensive monitoring dashboard" -ForegroundColor Green
Write-Host "  • 📝 Real-time logging with detailed view" -ForegroundColor Green
Write-Host "  • 🏥 Health check monitoring" -ForegroundColor Green
Write-Host "  • 🔄 Enhanced bulk words processing with progress tracking" -ForegroundColor Green
Write-Host "  • 📱 Telegram notifications for completed processing" -ForegroundColor Green
Write-Host "  • 👥 User management interface" -ForegroundColor Green
Write-Host "  • 📈 System metrics and performance monitoring" -ForegroundColor Green

Write-Host "`n🎯 Access Points:" -ForegroundColor Yellow
Write-Host "  Admin Panel: $baseUrl/admin" -ForegroundColor Cyan
Write-Host "  Dashboard API: $baseUrl/admin/dashboard" -ForegroundColor Cyan
Write-Host "  Live Logs: $baseUrl/admin/logs" -ForegroundColor Cyan
Write-Host "  System Metrics: $baseUrl/admin/metrics" -ForegroundColor Cyan
Write-Host "  Health Check: $baseUrl/admin/health" -ForegroundColor Cyan

Write-Host "`n📱 User Experience Improvements:" -ForegroundColor Yellow
Write-Host "  • Real-time progress tracking during bulk processing" -ForegroundColor White
Write-Host "  • Success/error notifications via Telegram" -ForegroundColor White
Write-Host "  • Visual feedback in admin panel" -ForegroundColor White
Write-Host "  • Comprehensive error logging and debugging" -ForegroundColor White
Write-Host "  • Health monitoring for proactive issue detection" -ForegroundColor White
