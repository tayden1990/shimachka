# Debug Bulk Word Processing
Write-Host "=== DEBUGGING BULK WORD PROCESSING ===" -ForegroundColor Green

# Test data
$testPayload = @{
    words = "test,hello,world"
    meaningLanguage = "English"
    definitionLanguage = "English"
    assignUsers = @()  # Empty array to test auto-assignment
} | ConvertTo-Json

Write-Host "`n1. Testing bulk words API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/admin/bulk-words-ai" -Method Post -Body $testPayload -ContentType "application/json" -Headers @{"Authorization"="Bearer admin:password"}
    Write-Host "Bulk processing response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.jobId) {
        Write-Host "`n2. Checking job status..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        $jobResponse = Invoke-RestMethod -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/admin/bulk-words-progress/$($response.jobId)" -Method Get -Headers @{"Authorization"="Bearer admin:password"}
        Write-Host "Job status:" -ForegroundColor Green
        $jobResponse | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n3. Testing users API..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/admin/users" -Method Get -Headers @{"Authorization"="Bearer admin:password"}
    Write-Host "Users in system:" -ForegroundColor Green
    $usersResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error getting users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ANALYSIS ===" -ForegroundColor Green
Write-Host "If users array is empty, that's why no cards are created."
Write-Host "You need to register at least one user via Telegram bot first."
Write-Host "Send /start to your bot in Telegram to create a test user."
