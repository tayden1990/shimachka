# Test Enhanced Admin Panel
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== TESTING ENHANCED ADMIN PANEL ===" -ForegroundColor Green

# Test 1: Admin Panel HTML Interface
Write-Host "`n1. Testing Admin Panel HTML Interface..." -ForegroundColor Yellow
try {
    $adminPanel = Invoke-WebRequest -Uri "$baseUrl/admin" -Method Get
    Write-Host "   Admin Panel Status: $($adminPanel.StatusCode)" -ForegroundColor Green
    Write-Host "   Content Type: $($adminPanel.Headers.'Content-Type')" -ForegroundColor White
    
    # Check if key features are present
    $hasMonitoring = $adminPanel.Content -match "Monitoring"
    $hasLogs = $adminPanel.Content -match "Logs"
    $hasBulkWords = $adminPanel.Content -match "Bulk Words"
    $hasHealthCheck = $adminPanel.Content -match "Health Check"
    
    Write-Host "   Features:" -ForegroundColor Cyan
    Write-Host "     Monitoring: $(if($hasMonitoring){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     Logs: $(if($hasLogs){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     Bulk Words: $(if($hasBulkWords){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "     Health Check: $(if($hasHealthCheck){'✅'}else{'❌'})" -ForegroundColor White
    
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Enhanced Bulk Words Processing
Write-Host "`n2. Testing Enhanced Bulk Words..." -ForegroundColor Yellow
$testData = @{
    words = "notification,dashboard,monitoring"
    meaningLanguage = "English"
    definitionLanguage = "English"
    assignUsers = @("235552633")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $testData -ContentType "application/json" -Headers $authHeader
    Write-Host "   Request submitted: Job $($response.jobId)" -ForegroundColor Green
    $jobId = $response.jobId
    
    # Monitor progress
    $attempts = 0
    do {
        Start-Sleep -Seconds 2
        $attempts++
        
        $progress = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$jobId" -Method Get -Headers $authHeader
        Write-Host "   Progress: $($progress.status) | $($progress.processedWords)/$($progress.totalWords)" -ForegroundColor Cyan
        
        if ($progress.status -eq "completed" -or $progress.status -eq "failed") {
            break
        }
    } while ($attempts -lt 8)
    
    if ($progress.status -eq "completed") {
        Write-Host "   Processing completed! Success: $($progress.successCount)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API Endpoints
Write-Host "`n3. Testing API Endpoints..." -ForegroundColor Yellow

# Dashboard
try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $authHeader
    Write-Host "   Dashboard API: ✅ Users: $($dashboard.totalUsers), Cards: $($dashboard.totalCards)" -ForegroundColor Green
} catch {
    Write-Host "   Dashboard API: ❌" -ForegroundColor Red
}

# Metrics
try {
    $metrics = Invoke-RestMethod -Uri "$baseUrl/admin/metrics" -Method Get -Headers $authHeader
    Write-Host "   Metrics API: ✅ Requests: $($metrics.requestCount)" -ForegroundColor Green
} catch {
    Write-Host "   Metrics API: ❌" -ForegroundColor Red
}

# Logs
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/admin/logs?limit=5" -Method Get -Headers $authHeader
    Write-Host "   Logs API: ✅ Recent logs: $($logs.logs.Count)" -ForegroundColor Green
} catch {
    Write-Host "   Logs API: ❌" -ForegroundColor Red
}

# Health Check
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Method Get -Headers $authHeader
    Write-Host "   Health API: ✅ Components checked: $($health.PSObject.Properties.Count)" -ForegroundColor Green
} catch {
    Write-Host "   Health API: ❌" -ForegroundColor Red
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "✅ New Features:" -ForegroundColor White
Write-Host "  • Comprehensive monitoring dashboard" -ForegroundColor Green
Write-Host "  • Real-time logging interface" -ForegroundColor Green  
Write-Host "  • Health check monitoring" -ForegroundColor Green
Write-Host "  • Enhanced bulk processing with notifications" -ForegroundColor Green
Write-Host "  • Visual progress tracking" -ForegroundColor Green

Write-Host "`nAccess the admin panel at:" -ForegroundColor Yellow
Write-Host "  $baseUrl/admin" -ForegroundColor Cyan
