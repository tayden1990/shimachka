# Comprehensive Leitner Bot Debugging & Testing Script
# Enhanced with logging monitoring and health checks

param(
    [string]$Action = "all",
    [string]$JobId = "",
    [int]$Limit = 50,
    [string]$LogLevel = "",
    [string]$Component = ""
)

$BotToken = "8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks"
$WorkerUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$WebhookUrl = "$WorkerUrl/webhook"

Write-Host "=== Leitner Bot Enhanced Debugging & Monitoring ===" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host "Worker URL: $WorkerUrl" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

function Test-Health {
    Write-Host "=== COMPREHENSIVE HEALTH CHECK ===" -ForegroundColor Green
    
    try {
        $healthResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/health" -Method Get -TimeoutSec 30
        
        Write-Host "Overall Status: $($healthResponse.status)" -ForegroundColor $(if($healthResponse.status -eq 'healthy') {'Green'} elseif($healthResponse.status -eq 'degraded') {'Yellow'} else {'Red'})
        Write-Host "Uptime: $([math]::Round($healthResponse.uptime / 1000, 2)) seconds"
        Write-Host "Environment: $($healthResponse.environment)"
        Write-Host "Version: $($healthResponse.version)"
        Write-Host ""
        
        Write-Host "Component Health:" -ForegroundColor Cyan
        foreach ($component in $healthResponse.checks.PSObject.Properties) {
            $status = $component.Value.status
            $color = switch ($status) {
                'up' { 'Green' }
                'degraded' { 'Yellow' }
                'down' { 'Red' }
                default { 'White' }
            }
            $responseTime = if ($component.Value.responseTime) { " ($($component.Value.responseTime)ms)" } else { "" }
            Write-Host "  $($component.Name): $status$responseTime" -ForegroundColor $color
            
            if ($component.Value.error) {
                Write-Host "    Error: $($component.Value.error)" -ForegroundColor Red
            }
            if ($component.Value.details) {
                Write-Host "    Details: $($component.Value.details | ConvertTo-Json -Compress)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "System Metrics:" -ForegroundColor Cyan
        Write-Host "  Requests/min: $($healthResponse.metrics.requestsPerMinute)"
        Write-Host "  Error Rate: $($healthResponse.metrics.errorRate)%"
        Write-Host "  Avg Response Time: $($healthResponse.metrics.avgResponseTime)ms"
        Write-Host "  Active Users: $($healthResponse.metrics.activeUsers)"
        
    } catch {
        Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-Metrics {
    Write-Host "=== SYSTEM METRICS ===" -ForegroundColor Green
    
    try {
        $metricsResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/metrics" -Method Get -TimeoutSec 30
        
        Write-Host "Today's Metrics:" -ForegroundColor Cyan
        if ($metricsResponse.today) {
            $today = $metricsResponse.today
            Write-Host "  Total Requests: $($today.requests.total)"
            Write-Host "  Webhook Requests: $($today.requests.webhook)"
            Write-Host "  Admin Requests: $($today.requests.admin)"
            Write-Host "  Health Requests: $($today.requests.health)"
            Write-Host "  Total Errors: $($today.errors.total)"
            Write-Host "  Avg Response Time: $($today.performance.avgResponseTime)ms"
            Write-Host "  Active Users: $($today.users.active)"
            Write-Host "  KV Operations: $($today.storage.kvOperations)"
        }
        
        if ($metricsResponse.trends) {
            Write-Host ""
            Write-Host "Trends:" -ForegroundColor Cyan
            Write-Host "  Request Growth: $($metricsResponse.trends.requestGrowth)"
            Write-Host "  Error Rate Change: $($metricsResponse.trends.errorRateChange)"
        }
        
    } catch {
        Write-Host "Metrics retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Get-Logs {
    param(
        [int]$LogLimit = 50,
        [string]$LogLevel = "",
        [string]$LogComponent = ""
    )
    
    Write-Host "=== SYSTEM LOGS ===" -ForegroundColor Green
    
    try {
        $params = @{
            limit = $LogLimit
        }
        if ($LogLevel) { $params.level = $LogLevel }
        if ($LogComponent) { $params.component = $LogComponent }
        
        $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
        $logsUrl = "$WorkerUrl/admin/logs?$queryString"
        
        $logsResponse = Invoke-RestMethod -Uri $logsUrl -Method Get -TimeoutSec 30
        
        Write-Host "Retrieved $($logsResponse.logs.Count) logs (Total: $($logsResponse.total))" -ForegroundColor Cyan
        if ($logsResponse.filters) {
            Write-Host "Filters: $($logsResponse.filters | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        Write-Host ""
        
        foreach ($log in $logsResponse.logs) {
            $color = switch ($log.level) {
                'DEBUG' { 'Gray' }
                'INFO' { 'White' }
                'WARN' { 'Yellow' }
                'ERROR' { 'Red' }
                'CRITICAL' { 'Magenta' }
                default { 'White' }
            }
            
            $timestamp = [DateTime]::Parse($log.timestamp).ToString("HH:mm:ss.fff")
            $duration = if ($log.duration) { " (${log.duration}ms)" } else { "" }
            
            Write-Host "[$timestamp] [$($log.level)] [$($log.component):$($log.action)]$duration $($log.message)" -ForegroundColor $color
            
            if ($log.data -and $log.data -ne "{}") {
                Write-Host "  Data: $($log.data | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
            }
            
            if ($log.error -and $log.stack) {
                Write-Host "  Stack: $($log.stack)" -ForegroundColor DarkRed
            }
        }
        
    } catch {
        Write-Host "Log retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-BulkWordsAI {
    Write-Host "=== TESTING BULK WORDS AI PROCESSING ===" -ForegroundColor Green
    
    try {
        # Test bulk word processing
        $testWords = @("investigation", "technology", "education", "communication", "development")
        $bulkRequest = @{
            words = $testWords
            meaningLanguage = "fa"
            definitionLanguage = "en"
            assignUsers = @()  # Empty to assign to all users
        }
        
        Write-Host "Submitting bulk words request..." -ForegroundColor Cyan
        Write-Host "Words: $($testWords -join ', ')" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri "$WorkerUrl/admin/bulk-words-ai" -Method Post -Body ($bulkRequest | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✓ Job submitted successfully!" -ForegroundColor Green
        Write-Host "Job ID: $($response.jobId)" -ForegroundColor Yellow
        Write-Host "Total Words: $($response.totalWords)" -ForegroundColor Yellow
        
        $global:LastJobId = $response.jobId
        
        # Monitor progress
        Write-Host ""
        Write-Host "Monitoring progress..." -ForegroundColor Cyan
        
        $maxAttempts = 30
        $attempt = 0
        
        do {
            Start-Sleep -Seconds 5
            $attempt++
            
            $progressResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/bulk-words-progress/$($response.jobId)" -Method Get -TimeoutSec 30
            
            $status = $progressResponse.status
            $processed = $progressResponse.processedWords
            $total = $progressResponse.totalWords
            $successCount = $progressResponse.successCount
            $errorCount = $progressResponse.errorCount
            
            Write-Host "[$attempt] Status: $status | Progress: $processed/$total | Success: $successCount | Errors: $errorCount" -ForegroundColor $(if($status -eq 'completed') {'Green'} elseif($status -eq 'failed') {'Red'} else {'Yellow'})
            
            if ($progressResponse.logs -and $progressResponse.logs.Count -gt 0) {
                $recentLogs = $progressResponse.logs | Select-Object -Last 3
                foreach ($logEntry in $recentLogs) {
                    Write-Host "  Log: $logEntry" -ForegroundColor Gray
                }
            }
            
        } while ($status -eq 'processing' -and $attempt -lt $maxAttempts)
        
        if ($status -eq 'completed') {
            Write-Host "✓ Bulk processing completed successfully!" -ForegroundColor Green
            Write-Host "Final Results:" -ForegroundColor Cyan
            Write-Host "  Processed: $($progressResponse.processedWords)/$($progressResponse.totalWords)" -ForegroundColor White
            Write-Host "  Successful: $($progressResponse.successCount)" -ForegroundColor Green
            Write-Host "  Errors: $($progressResponse.errorCount)" -ForegroundColor Red
            
            if ($progressResponse.results) {
                Write-Host ""
                Write-Host "Word Results:" -ForegroundColor Cyan
                foreach ($result in $progressResponse.results) {
                    $color = if ($result.status -eq 'success') { 'Green' } else { 'Red' }
                    Write-Host "  $($result.word): $($result.status)" -ForegroundColor $color
                    if ($result.meaning) {
                        Write-Host "    Meaning: $($result.meaning)" -ForegroundColor Gray
                    }
                    if ($result.error) {
                        Write-Host "    Error: $($result.error)" -ForegroundColor Red
                    }
                }
            }
        } elseif ($status -eq 'failed') {
            Write-Host "✗ Bulk processing failed!" -ForegroundColor Red
            if ($progressResponse.error) {
                Write-Host "Error: $($progressResponse.error)" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠ Processing timeout reached" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Bulk words AI test failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
    Write-Host ""
}

function Test-JobProgress {
    param([string]$JobId)
    
    if (-not $JobId) {
        if ($global:LastJobId) {
            $JobId = $global:LastJobId
            Write-Host "Using last job ID: $JobId" -ForegroundColor Yellow
        } else {
            Write-Host "No job ID provided and no previous job found" -ForegroundColor Red
            return
        }
    }
    
    Write-Host "=== CHECKING JOB PROGRESS: $JobId ===" -ForegroundColor Green
    
    try {
        $progressResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/bulk-words-progress/$JobId" -Method Get -TimeoutSec 30
        
        Write-Host "Job Status: $($progressResponse.status)" -ForegroundColor $(if($progressResponse.status -eq 'completed') {'Green'} elseif($progressResponse.status -eq 'failed') {'Red'} else {'Yellow'})
        Write-Host "Progress: $($progressResponse.processedWords)/$($progressResponse.totalWords) words"
        Write-Host "Success: $($progressResponse.successCount) | Errors: $($progressResponse.errorCount)"
        
        if ($progressResponse.startTime) {
            Write-Host "Started: $($progressResponse.startTime)"
        }
        if ($progressResponse.endTime) {
            Write-Host "Ended: $($progressResponse.endTime)"
        }
        if ($progressResponse.error) {
            Write-Host "Error: $($progressResponse.error)" -ForegroundColor Red
        }
        
        if ($progressResponse.logs -and $progressResponse.logs.Count -gt 0) {
            Write-Host ""
            Write-Host "Recent Logs:" -ForegroundColor Cyan
            $progressResponse.logs | Select-Object -Last 10 | ForEach-Object {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }
        
        if ($progressResponse.results -and $progressResponse.results.Count -gt 0) {
            Write-Host ""
            Write-Host "Results:" -ForegroundColor Cyan
            foreach ($result in $progressResponse.results) {
                $color = if ($result.status -eq 'success') { 'Green' } else { 'Red' }
                Write-Host "  $($result.word): $($result.status)" -ForegroundColor $color
            }
        }
        
    } catch {
        Write-Host "Job progress check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-WebhookSimulation {
    Write-Host "=== WEBHOOK SIMULATION ===" -ForegroundColor Green
    
    try {
        # Simulate a /start command
        $webhookData = @{
            update_id = 123456789
            message = @{
                message_id = 1
                from = @{
                    id = 987654321
                    is_bot = $false
                    first_name = "Test"
                    last_name = "User"
                    username = "testuser"
                    language_code = "en"
                }
                chat = @{
                    id = 987654321
                    first_name = "Test"
                    last_name = "User"
                    username = "testuser"
                    type = "private"
                }
                date = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                text = "/start"
            }
        }
        
        Write-Host "Sending webhook simulation..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body ($webhookData | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✓ Webhook simulation successful!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Yellow
        
    } catch {
        Write-Host "Webhook simulation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}
        
    } catch {
        Write-Host "Webhook simulation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Execute based on action parameter
switch ($Action.ToLower()) {
    "health" { Test-Health }
    "metrics" { Test-Metrics }
    "logs" { Get-Logs -LogLimit $Limit -LogLevel $LogLevel -LogComponent $Component }
    "bulk" { Test-BulkWordsAI }
    "job" { Test-JobProgress -JobId $JobId }
    "webhook" { Test-WebhookSimulation }
    "all" {
        Test-Health
        Test-Metrics
        Get-Logs -LogLimit 20 -LogLevel "ERROR"
        Test-WebhookSimulation
        Test-BulkWordsAI
    }
    default {
        Write-Host "Available actions:" -ForegroundColor Cyan
        Write-Host "  health   - Run comprehensive health check"
        Write-Host "  metrics  - View system metrics"
        Write-Host "  logs     - View system logs (use -LogLevel and -Component to filter)"
        Write-Host "  bulk     - Test bulk words AI processing"
        Write-Host "  job      - Check job progress (use -JobId)"
        Write-Host "  webhook  - Test webhook simulation"
        Write-Host "  all      - Run all tests"
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\enhanced-debug.ps1 -Action health"
        Write-Host "  .\enhanced-debug.ps1 -Action logs -LogLevel ERROR -Limit 100"
        Write-Host "  .\enhanced-debug.ps1 -Action job -JobId 'job_123456'"
    }
}

Write-Host "=== DEBUG SESSION COMPLETE ===" -ForegroundColor Cyan
