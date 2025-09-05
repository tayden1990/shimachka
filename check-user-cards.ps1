# Check if cards were actually created for users
Write-Host "=== CHECKING USER CARDS ===" -ForegroundColor Green

$userIds = @(123456789, 235552633, 5770018317)

foreach ($userId in $userIds) {
    Write-Host "`nChecking cards for user ID: $userId" -ForegroundColor Yellow
    try {
        # Try to get user cards directly from admin API
        $userResponse = Invoke-RestMethod -Uri "https://leitner-telegram-bot.t-ak-sa.workers.dev/admin/users/$userId/details" -Method Get -Headers @{"Authorization"="Bearer admin:password"}
        
        Write-Host "User: $($userResponse.user.firstName) (@$($userResponse.user.username))" -ForegroundColor White
        Write-Host "Total Cards: $($userResponse.cards.length)" -ForegroundColor $(if ($userResponse.cards.length -gt 0) { "Green" } else { "Red" })
        
        if ($userResponse.cards.length -gt 0) {
            Write-Host "Recent cards:" -ForegroundColor Green
            $userResponse.cards | Select-Object -First 5 | ForEach-Object {
                Write-Host "  - $($_.word): $($_.meaning)" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "Error getting user $userId details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== DIAGNOSIS ===" -ForegroundColor Green
Write-Host "If no cards are shown above, the issue is that cards are not being created."
Write-Host "Check the logs during bulk processing to see where it fails."
