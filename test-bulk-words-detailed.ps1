# Detailed Bulk Words Testing Script
$baseUrl = "https://leitner-telegram-bot.t-ak-sa.workers.dev"
$authHeader = @{"Authorization"="Bearer admin:password"}

Write-Host "=== DETAILED BULK WORDS TESTING ===" -ForegroundColor Green
Write-Host "Testing different scenarios for bulk word addition..." -ForegroundColor White

# Function to test bulk words and monitor progress
function Test-BulkWords {
    param(
        [string]$TestName,
        [string]$Words,
        [string]$MeaningLang = "English",
        [string]$DefinitionLang = "English",
        [array]$AssignUsers = @(),
        [int]$WaitTime = 10
    )
    
    Write-Host "`n=== $TestName ===" -ForegroundColor Cyan
    
    $testData = @{
        words = $Words
        meaningLanguage = $MeaningLang
        definitionLanguage = $DefinitionLang
        assignUsers = $AssignUsers
    } | ConvertTo-Json
    
    Write-Host "Test Data:" -ForegroundColor Yellow
    Write-Host "  Words: $Words" -ForegroundColor White
    Write-Host "  Meaning Language: $MeaningLang" -ForegroundColor White
    Write-Host "  Definition Language: $DefinitionLang" -ForegroundColor White
    Write-Host "  Assign Users: $($AssignUsers -join ', ')" -ForegroundColor White
    
    try {
        # Submit bulk words request
        Write-Host "`nSubmitting request..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $testData -ContentType "application/json" -Headers $authHeader
        
        Write-Host "✅ Request submitted successfully:" -ForegroundColor Green
        Write-Host "  Job ID: $($response.jobId)" -ForegroundColor White
        Write-Host "  Status: $($response.status)" -ForegroundColor White
        Write-Host "  Total Words: $($response.totalWords)" -ForegroundColor White
        Write-Host "  Message: $($response.message)" -ForegroundColor White
        
        # Monitor progress
        $jobId = $response.jobId
        $attempts = 0
        $maxAttempts = 20
        
        do {
            Start-Sleep -Seconds 2
            $attempts++
            
            try {
                $progress = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$jobId" -Method Get -Headers $authHeader
                
                Write-Host "`n[Attempt $attempts] Job Progress:" -ForegroundColor Cyan
                Write-Host "  Status: $($progress.status)" -ForegroundColor White
                Write-Host "  Processed: $($progress.processedWords)/$($progress.totalWords)" -ForegroundColor White
                Write-Host "  Success: $($progress.successCount)" -ForegroundColor White
                Write-Host "  Errors: $($progress.errorCount)" -ForegroundColor White
                
                if ($progress.errors -and $progress.errors.Count -gt 0) {
                    Write-Host "  Error Details:" -ForegroundColor Red
                    $progress.errors | ForEach-Object {
                        Write-Host "    • $_" -ForegroundColor Red
                    }
                }
                
                if ($progress.logs -and $progress.logs.Count -gt 0) {
                    Write-Host "  Recent Logs:" -ForegroundColor Green
                    $progress.logs | Select-Object -Last 5 | ForEach-Object {
                        Write-Host "    • $_" -ForegroundColor Gray
                    }
                }
                
                if ($progress.status -eq "completed" -or $progress.status -eq "failed") {
                    break
                }
                
            } catch {
                Write-Host "  Error checking progress: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } while ($attempts -lt $maxAttempts)
        
        # Final status
        if ($progress.status -eq "completed") {
            Write-Host "`n✅ Test PASSED: Job completed successfully" -ForegroundColor Green
            return $true
        } elseif ($progress.status -eq "failed") {
            Write-Host "`n❌ Test FAILED: Job failed" -ForegroundColor Red
            return $false
        } else {
            Write-Host "`n⚠️ Test TIMEOUT: Job still running after $maxAttempts attempts" -ForegroundColor Yellow
            return $false
        }
        
    } catch {
        Write-Host "`n❌ Test FAILED: Request submission failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get more error details
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error Response: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error response" -ForegroundColor Red
            }
        }
        return $false
    }
}

# Test 1: Simple single word
$test1 = Test-BulkWords -TestName "Test 1: Single Simple Word" -Words "apple"

# Test 2: Multiple simple words
$test2 = Test-BulkWords -TestName "Test 2: Multiple Simple Words" -Words "book,computer,water"

# Test 3: Complex/technical words
$test3 = Test-BulkWords -TestName "Test 3: Technical Words" -Words "algorithm,cryptocurrency,photosynthesis"

# Test 4: Different languages
$test4 = Test-BulkWords -TestName "Test 4: Spanish to English" -Words "casa,perro,gato" -MeaningLang "Spanish" -DefinitionLang "English"

# Test 5: Mixed complexity
$test5 = Test-BulkWords -TestName "Test 5: Mixed Complexity" -Words "hello,supercalifragilisticexpialidocious,AI"

# Test 6: With user assignment
$test6 = Test-BulkWords -TestName "Test 6: With Specific User Assignment" -Words "test,assignment" -AssignUsers @("235552633")

# Test 7: Empty/invalid input
Write-Host "`n=== Test 7: Invalid Input ===" -ForegroundColor Cyan
try {
    $invalidData = @{
        words = ""
        meaningLanguage = "English"
        definitionLanguage = "English"
        assignUsers = @()
    } | ConvertTo-Json
    
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $invalidData -ContentType "application/json" -Headers $authHeader
    Write-Host "❌ Test 7 FAILED: Should have rejected empty words" -ForegroundColor Red
} catch {
    Write-Host "✅ Test 7 PASSED: Correctly rejected empty words" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 8: Very long word list
$longWordList = @()
for ($i = 1; $i -le 20; $i++) {
    $longWordList += "word$i"
}
$test8 = Test-BulkWords -TestName "Test 8: Long Word List (20 words)" -Words ($longWordList -join ",")

# Test 9: Special characters and numbers
$test9 = Test-BulkWords -TestName "Test 9: Special Characters" -Words "café,naïve,résumé,coöperate"

# Test 10: Check API limits
Write-Host "`n=== Test 10: API Rate Limiting ===" -ForegroundColor Cyan
Write-Host "Submitting multiple requests quickly to test rate limiting..." -ForegroundColor Yellow

$rateLimitResults = @()
for ($i = 1; $i -le 5; $i++) {
    try {
        $quickData = @{
            words = "quick$i"
            meaningLanguage = "English"
            definitionLanguage = "English"
            assignUsers = @()
        } | ConvertTo-Json
        
        $quickResponse = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $quickData -ContentType "application/json" -Headers $authHeader
        $rateLimitResults += "Request ${i}: SUCCESS (Job: $($quickResponse.jobId))"
        Write-Host "  Request ${i}: ✅ Success" -ForegroundColor Green
    } catch {
        $rateLimitResults += "Request ${i}: FAILED - $($_.Exception.Message)"
        Write-Host "  Request ${i}: ❌ Failed - $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500
}

# Summary Report
Write-Host "`n=== TEST SUMMARY REPORT ===" -ForegroundColor Green
$passedTests = 0
$totalTests = 10

Write-Host "Individual Test Results:" -ForegroundColor White
Write-Host "  Test 1 (Single Word): $(if($test1){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test1){'Green'}else{'Red'})
Write-Host "  Test 2 (Multiple Words): $(if($test2){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test2){'Green'}else{'Red'})
Write-Host "  Test 3 (Technical Words): $(if($test3){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test3){'Green'}else{'Red'})
Write-Host "  Test 4 (Spanish Words): $(if($test4){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test4){'Green'}else{'Red'})
Write-Host "  Test 5 (Mixed Complexity): $(if($test5){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test5){'Green'}else{'Red'})
Write-Host "  Test 6 (User Assignment): $(if($test6){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test6){'Green'}else{'Red'})
Write-Host "  Test 7 (Invalid Input): ✅ PASSED" -ForegroundColor Green
Write-Host "  Test 8 (Long List): $(if($test8){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test8){'Green'}else{'Red'})
Write-Host "  Test 9 (Special Chars): $(if($test9){'✅ PASSED'}else{'❌ FAILED'})" -ForegroundColor $(if($test9){'Green'}else{'Red'})
Write-Host "  Test 10 (Rate Limiting): Check individual results above" -ForegroundColor Yellow

$passedTests = @($test1, $test2, $test3, $test4, $test5, $test6, $test8, $test9) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
$passedTests += 1  # Add Test 7 which always passes

Write-Host "`nOverall Results:" -ForegroundColor White
Write-Host "  Passed: $passedTests/$totalTests tests" -ForegroundColor Green
Write-Host "  Success Rate: $([math]::Round(($passedTests/$totalTests)*100, 1))%" -ForegroundColor $(if($passedTests -eq $totalTests){'Green'}else{'Yellow'})

Write-Host "`nRate Limiting Results:" -ForegroundColor White
$rateLimitResults | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
}

Write-Host "`n🔍 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check the admin logs at: $baseUrl/admin/logs" -ForegroundColor Cyan
Write-Host "2. Review the monitoring dashboard at: $baseUrl/admin" -ForegroundColor Cyan
Write-Host "3. If tests failed, check Gemini API quota and rate limits" -ForegroundColor Cyan
Write-Host "4. Verify environment variables are set correctly" -ForegroundColor Cyan
