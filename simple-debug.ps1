# Simple but comprehensive Leitner Bot debugging script
param(
    [string]$Action = "all"
)

$BotToken = "8202936854:AAGJgytDWy-3NuALTFUG2o6U_jfgvuW_cks"
$WorkerUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"

Write-Host "=== Leitner Bot Enhanced Debugging ===" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host "Worker URL: $WorkerUrl" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

function Test-Health {
    Write-Host "=== COMPREHENSIVE HEALTH CHECK ===" -ForegroundColor Green
    
    try {
        $healthResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/health" -Method Get -TimeoutSec 30
        
        Write-Host "Overall Status: $($healthResponse.status)" -ForegroundColor $(
            if($healthResponse.status -eq 'healthy') {'Green'} 
            elseif($healthResponse.status -eq 'degraded') {'Yellow'} 
            else {'Red'}
        )
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

function Test-BulkWords {
    Write-Host "=== TESTING BULK WORDS AI ===" -ForegroundColor Green
    
    try {
        $testWords = @("investigation", "technology", "education")
        $bulkRequest = @{
            words = $testWords
            meaningLanguage = "fa"
            definitionLanguage = "en"
            assignUsers = @()
        }
        
        Write-Host "Submitting bulk words request..." -ForegroundColor Cyan
        Write-Host "Words: $($testWords -join ', ')" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri "$WorkerUrl/admin/bulk-words-ai" -Method Post -Body ($bulkRequest | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✓ Job submitted successfully!" -ForegroundColor Green
        Write-Host "Job ID: $($response.jobId)" -ForegroundColor Yellow
        Write-Host "Total Words: $($response.totalWords)" -ForegroundColor Yellow
        
        # Monitor progress
        Write-Host "Monitoring progress..." -ForegroundColor Cyan
        
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Seconds 3
            
            $progressResponse = Invoke-RestMethod -Uri "$WorkerUrl/admin/bulk-words-progress/$($response.jobId)" -Method Get -TimeoutSec 30
            
            $status = $progressResponse.status
            $processed = $progressResponse.processedWords
            $total = $progressResponse.totalWords
            
            Write-Host "[$($i+1)] Status: $status | Progress: $processed/$total" -ForegroundColor Yellow
            
            if ($status -eq 'completed' -or $status -eq 'failed') {
                Write-Host "Final Status: $status" -ForegroundColor $(if($status -eq 'completed') {'Green'} else {'Red'})
                Write-Host "Success: $($progressResponse.successCount) | Errors: $($progressResponse.errorCount)"
                break
            }
        }
        
    } catch {
        Write-Host "Bulk words test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-Logs {
    Write-Host "=== RECENT ERROR LOGS ===" -ForegroundColor Green
    
    try {
        $logsUrl = "$WorkerUrl/admin/logs?level=ERROR`&limit=20"
        $logsResponse = Invoke-RestMethod -Uri $logsUrl -Method Get -TimeoutSec 30
        
        Write-Host "Found $($logsResponse.logs.Count) error logs" -ForegroundColor Cyan
        
        foreach ($log in $logsResponse.logs) {
            $timestamp = [DateTime]::Parse($log.timestamp).ToString("HH:mm:ss")
            Write-Host "[$timestamp] [$($log.component):$($log.action)] $($log.message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "Log retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-Webhook {
    Write-Host "=== WEBHOOK TEST ===" -ForegroundColor Green
    
    try {
        $webhookData = @{
            update_id = 123456789
            message = @{
                message_id = 1
                from = @{
                    id = 987654321
                    is_bot = $false
                    first_name = "Test"
                    username = "testuser"
                }
                chat = @{
                    id = 987654321
                    type = "private"
                }
                date = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                text = "/start"
            }
        }
        
        $response = Invoke-RestMethod -Uri "$WorkerUrl/webhook" -Method Post -Body ($webhookData | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✓ Webhook test successful!" -ForegroundColor Green
        
    } catch {
        Write-Host "Webhook test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Execute based on action parameter
switch ($Action.ToLower()) {
    "health" { Test-Health }
    "bulk" { Test-BulkWords }
    "logs" { Test-Logs }
    "webhook" { Test-Webhook }
    "all" {
        Test-Health
        Test-Logs
        Test-Webhook
        Test-BulkWords
    }
    default {
        Write-Host "Available actions: health, bulk, logs, webhook, all" -ForegroundColor Cyan
    }
}

Write-Host "=== DEBUG SESSION COMPLETE ===" -ForegroundColor Cyan
