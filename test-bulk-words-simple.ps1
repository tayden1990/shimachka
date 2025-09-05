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
        
        Write-Host "Request submitted successfully:" -ForegroundColor Green
        Write-Host "  Job ID: $($response.jobId)" -ForegroundColor White
        Write-Host "  Status: $($response.status)" -ForegroundColor White
        Write-Host "  Total Words: $($response.totalWords)" -ForegroundColor White
        Write-Host "  Message: $($response.message)" -ForegroundColor White
        
        # Monitor progress
        $jobId = $response.jobId
        $attempts = 0
        $maxAttempts = 15
        
        do {
            Start-Sleep -Seconds 2
            $attempts++
            
            try {
                $progress = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-progress/$jobId" -Method Get -Headers $authHeader
                
                Write-Host "`nProgress check $attempts" -ForegroundColor Cyan
                Write-Host "  Status: $($progress.status)" -ForegroundColor White
                Write-Host "  Processed: $($progress.processedWords)/$($progress.totalWords)" -ForegroundColor White
                Write-Host "  Success: $($progress.successCount)" -ForegroundColor White
                Write-Host "  Errors: $($progress.errorCount)" -ForegroundColor White
                
                if ($progress.errors -and $progress.errors.Count -gt 0) {
                    Write-Host "  Error Details:" -ForegroundColor Red
                    $progress.errors | ForEach-Object {
                        Write-Host "    Error: $_" -ForegroundColor Red
                    }
                }
                
                if ($progress.logs -and $progress.logs.Count -gt 0) {
                    Write-Host "  Recent Logs:" -ForegroundColor Green
                    $progress.logs | Select-Object -Last 3 | ForEach-Object {
                        Write-Host "    Log: $_" -ForegroundColor Gray
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
            Write-Host "`nTest PASSED: Job completed successfully" -ForegroundColor Green
            return $true
        } elseif ($progress.status -eq "failed") {
            Write-Host "`nTest FAILED: Job failed" -ForegroundColor Red
            return $false
        } else {
            Write-Host "`nTest TIMEOUT: Job still running after $maxAttempts attempts" -ForegroundColor Yellow
            return $false
        }
        
    } catch {
        Write-Host "`nTest FAILED: Request submission failed" -ForegroundColor Red
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
Write-Host "`n" + "="*60 -ForegroundColor Blue
$test1 = Test-BulkWords -TestName "Test 1: Single Simple Word" -Words "apple"

# Test 2: Multiple simple words
Write-Host "`n" + "="*60 -ForegroundColor Blue
$test2 = Test-BulkWords -TestName "Test 2: Multiple Simple Words" -Words "book,computer,water"

# Test 3: Complex/technical words
Write-Host "`n" + "="*60 -ForegroundColor Blue
$test3 = Test-BulkWords -TestName "Test 3: Technical Words" -Words "algorithm,cryptocurrency,photosynthesis"

# Test 4: Different languages
Write-Host "`n" + "="*60 -ForegroundColor Blue
$test4 = Test-BulkWords -TestName "Test 4: Spanish to English" -Words "casa,perro,gato" -MeaningLang "Spanish" -DefinitionLang "English"

# Test 5: With user assignment
Write-Host "`n" + "="*60 -ForegroundColor Blue
$test5 = Test-BulkWords -TestName "Test 5: With Specific User Assignment" -Words "test,assignment" -AssignUsers @("235552633")

# Test 6: Empty/invalid input
Write-Host "`n" + "="*60 -ForegroundColor Blue
Write-Host "`n=== Test 6: Invalid Input ===" -ForegroundColor Cyan
try {
    $invalidData = @{
        words = ""
        meaningLanguage = "English"
        definitionLanguage = "English"
        assignUsers = @()
    } | ConvertTo-Json
    
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/admin/bulk-words-ai" -Method Post -Body $invalidData -ContentType "application/json" -Headers $authHeader
    Write-Host "Test 6 FAILED: Should have rejected empty words" -ForegroundColor Red
    $test6 = $false
} catch {
    Write-Host "Test 6 PASSED: Correctly rejected empty words" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    $test6 = $true
}

# Summary Report
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "=== TEST SUMMARY REPORT ===" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

$totalTests = 6
$passedTests = 0

Write-Host "`nIndividual Test Results:" -ForegroundColor White
if ($test1) { 
    Write-Host "  Test 1 (Single Word): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 1 (Single Word): FAILED" -ForegroundColor Red
}

if ($test2) { 
    Write-Host "  Test 2 (Multiple Words): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 2 (Multiple Words): FAILED" -ForegroundColor Red
}

if ($test3) { 
    Write-Host "  Test 3 (Technical Words): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 3 (Technical Words): FAILED" -ForegroundColor Red
}

if ($test4) { 
    Write-Host "  Test 4 (Spanish Words): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 4 (Spanish Words): FAILED" -ForegroundColor Red
}

if ($test5) { 
    Write-Host "  Test 5 (User Assignment): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 5 (User Assignment): FAILED" -ForegroundColor Red
}

if ($test6) { 
    Write-Host "  Test 6 (Invalid Input): PASSED" -ForegroundColor Green
    $passedTests++
} else { 
    Write-Host "  Test 6 (Invalid Input): FAILED" -ForegroundColor Red
}

Write-Host "`nOverall Results:" -ForegroundColor White
Write-Host "  Passed: $passedTests/$totalTests tests" -ForegroundColor $(if($passedTests -eq $totalTests){'Green'}else{'Yellow'})
$successRate = [math]::Round(($passedTests/$totalTests)*100, 1)
Write-Host "  Success Rate: $successRate%" -ForegroundColor $(if($passedTests -eq $totalTests){'Green'}else{'Yellow'})

Write-Host "`nNext Steps for Debugging:" -ForegroundColor Yellow
Write-Host "1. Check admin logs: $baseUrl/admin/logs" -ForegroundColor Cyan
Write-Host "2. Review monitoring dashboard: $baseUrl/admin" -ForegroundColor Cyan
Write-Host "3. Check Gemini API quota and rate limits" -ForegroundColor Cyan
Write-Host "4. Verify environment variables" -ForegroundColor Cyan

if ($passedTests -lt $totalTests) {
    Write-Host "`nFailure Analysis:" -ForegroundColor Red
    Write-Host "- Check if Gemini API key is valid and has quota" -ForegroundColor Yellow
    Write-Host "- Verify network connectivity to Google AI API" -ForegroundColor Yellow
    Write-Host "- Check for rate limiting issues" -ForegroundColor Yellow
    Write-Host "- Review server logs for detailed error messages" -ForegroundColor Yellow
} else {
    Write-Host "`nAll tests passed! Bulk words functionality is working correctly." -ForegroundColor Green
}
