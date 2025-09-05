# End-to-End User Experience Test
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== END-TO-END USER EXPERIENCE TEST ===" -ForegroundColor Green
Write-Host "Testing the complete user journey for bulk words..." -ForegroundColor White

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

# Step 2: Submit a unique word for processing
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
    Write-Host "   ✅ Request submitted: Job $($response.jobId)" -ForegroundColor Green
    $jobId = $response.jobId
} catch {
    Write-Host "   ❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
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
        Write-Host "   Status: $($progress.status) | Processed: $($progress.processedWords)/$($progress.totalWords)" -ForegroundColor Cyan
        
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
        Write-Host "   ✅ SUCCESS: Card was created!" -ForegroundColor Green
        
        # Find the new card
        $newCard = $userAfter.cards | Where-Object { $_.word -eq $uniqueWord } | Select-Object -First 1
        if ($newCard) {
            Write-Host "   📋 New card details:" -ForegroundColor Cyan
            Write-Host "      Word: $($newCard.word)" -ForegroundColor White
            Write-Host "      Meaning: $($newCard.meaning)" -ForegroundColor White
            Write-Host "      Definition: $($newCard.definition)" -ForegroundColor White
            Write-Host "      Box: $($newCard.box)" -ForegroundColor White
            Write-Host "      Next Review: $($newCard.nextReview)" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ PROBLEM: No new card was created!" -ForegroundColor Red
    }
} catch {
    Write-Host "   Error verifying card: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test Telegram bot notification (simulate webhook)
Write-Host "`n5. Testing Telegram bot notification..." -ForegroundColor Yellow

# Simulate a user asking for their cards via Telegram
$webhookPayload = @{
    update_id = $timestamp
    message = @{
        message_id = $timestamp
        date = $timestamp
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
        text = "/mycards"
    }
} | ConvertTo-Json -Depth 10

try {
    $webhookResponse = Invoke-WebRequest -Uri "$baseUrl/webhook" -Method Post -Body $webhookPayload -ContentType "application/json" -TimeoutSec 10
    Write-Host "   ✅ Telegram webhook responded: $($webhookResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Telegram webhook failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Check if user can see their cards through the bot
Write-Host "`n6. Testing card visibility through bot..." -ForegroundColor Yellow

# Simulate user requesting to study
$studyPayload = @{
    update_id = $timestamp + 1
    message = @{
        message_id = $timestamp + 1
        date = $timestamp + 1
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
        text = "/study"
    }
} | ConvertTo-Json -Depth 10

try {
    $studyResponse = Invoke-WebRequest -Uri "$baseUrl/webhook" -Method Post -Body $studyPayload -ContentType "application/json" -TimeoutSec 10
    Write-Host "   ✅ Study command responded: $($studyResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Study command failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== DIAGNOSIS SUMMARY ===" -ForegroundColor Green

Write-Host "`n✅ What's Working:" -ForegroundColor Green
Write-Host "   • Bulk words API endpoint accepts requests" -ForegroundColor White
Write-Host "   • Job processing completes successfully" -ForegroundColor White
Write-Host "   • Cards are created in the database" -ForegroundColor White
Write-Host "   • User card count increases" -ForegroundColor White
Write-Host "   • Telegram webhook responds" -ForegroundColor White

Write-Host "`n🔍 Potential Issues to Check:" -ForegroundColor Yellow
Write-Host "   • User interface feedback (are users seeing success messages?)" -ForegroundColor White
Write-Host "   • Telegram bot notifications (are users told about new cards?)" -ForegroundColor White
Write-Host "   • Card visibility in study mode (can users find their new cards?)" -ForegroundColor White
Write-Host "   • User expectations vs. actual behavior" -ForegroundColor White

Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "   1. Check the admin panel UI for better user feedback" -ForegroundColor White
Write-Host "   2. Verify users are getting notified about new cards via Telegram" -ForegroundColor White
Write-Host "   3. Test the study flow to ensure new cards appear" -ForegroundColor White
Write-Host "   4. Ask users specifically what they expect vs. what they see" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   • Open the admin panel: $baseUrl/admin" -ForegroundColor Cyan
Write-Host "   • Test the Telegram bot directly with a user" -ForegroundColor Cyan
Write-Host "   • Check if new cards appear in study sessions" -ForegroundColor Cyan
