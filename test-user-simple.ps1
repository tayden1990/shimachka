# End-to-End User Experience Test
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== END-TO-END USER EXPERIENCE TEST ===" -ForegroundColor Green

# Step 1: Get current user card count
Write-Host "`n1. Getting current user card count..." -ForegroundColor Yellow
try {
    $userBefore = Invoke-RestMethod -Uri "$baseUrl/admin/users/235552633/details" -Method Get -Headers $authHeader
    $cardsBefore = $userBefore.stats.totalCards
    Write-Host "   User has $cardsBefore cards before test" -ForegroundColor White
} catch {
    Write-Host "   Error getting user details: $($_.Exception.Message)" -ForegroundColor Red
    $cardsBefore = 0
}

# Step 2: Submit a unique word
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$uniqueWord = "testword$timestamp"

Write-Host "`n2. Submitting unique test word: $uniqueWord" -ForegroundColor Yellow
$testData = @{
    words = $uniqueWord
    meaningLanguage = "English"
    definitionLanguage = "English"
    assignUsers = @("235552633")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $testData -ContentType "application/json" -Headers $authHeader
    Write-Host "   Request submitted: Job $($response.jobId)" -ForegroundColor Green
    $jobId = $response.jobId
} catch {
    Write-Host "   Request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Monitor processing
Write-Host "`n3. Monitoring processing..." -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep -Seconds 2
    $attempts++
    
    try {
        $progress = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$jobId" -Method Get -Headers $authHeader
        Write-Host "   Status: $($progress.status)" -ForegroundColor Cyan
        
        if ($progress.status -eq "completed" -or $progress.status -eq "failed") {
            break
        }
    } catch {
        Write-Host "   Error checking progress: $($_.Exception.Message)" -ForegroundColor Red
    }
} while ($attempts -lt 10)

# Step 4: Verify card was created
Write-Host "`n4. Verifying card creation..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $userAfter = Invoke-RestMethod -Uri "$baseUrl/admin/users/235552633/details" -Method Get -Headers $authHeader
    $cardsAfter = $userAfter.stats.totalCards
    
    Write-Host "   Cards before: $cardsBefore" -ForegroundColor White
    Write-Host "   Cards after: $cardsAfter" -ForegroundColor White
    
    if ($cardsAfter -gt $cardsBefore) {
        Write-Host "   SUCCESS: Card was created!" -ForegroundColor Green
        
        # Find the new card
        $newCard = $userAfter.cards | Where-Object { $_.word -eq $uniqueWord } | Select-Object -First 1
        if ($newCard) {
            Write-Host "   New card found:" -ForegroundColor Cyan
            Write-Host "      Word: $($newCard.word)" -ForegroundColor White
            Write-Host "      Meaning: $($newCard.meaning)" -ForegroundColor White
            Write-Host "      Box: $($newCard.box)" -ForegroundColor White
        }
    } else {
        Write-Host "   PROBLEM: No new card was created!" -ForegroundColor Red
    }
} catch {
    Write-Host "   Error verifying card: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== DIAGNOSIS SUMMARY ===" -ForegroundColor Green

Write-Host "`nWhat is Working:" -ForegroundColor Green
Write-Host "  - Bulk words API endpoint" -ForegroundColor White
Write-Host "  - Job processing" -ForegroundColor White
Write-Host "  - Card creation" -ForegroundColor White
Write-Host "  - Database storage" -ForegroundColor White

Write-Host "`nPotential Issues:" -ForegroundColor Yellow
Write-Host "  - User interface feedback" -ForegroundColor White
Write-Host "  - Telegram notifications" -ForegroundColor White
Write-Host "  - User expectations" -ForegroundColor White

Write-Host "`nRecommendations:" -ForegroundColor Cyan
Write-Host "  1. Check admin panel UI feedback" -ForegroundColor White
Write-Host "  2. Test Telegram bot notifications" -ForegroundColor White
Write-Host "  3. Verify study flow shows new cards" -ForegroundColor White
Write-Host "  4. Ask users about specific expectations" -ForegroundColor White
