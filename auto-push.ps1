# Auto-push watcher script for ATHAHAR ROADWAYS project
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ATHAHAR ROADWAYS - Git Auto-Push Watcher     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Watching for file changes every 15 seconds." -ForegroundColor Yellow
Write-Host "Press Ctrl + C in this terminal to stop at any time.`n" -ForegroundColor Yellow

while ($true) {
    Start-Sleep -Seconds 15
    $changes = git status --porcelain
    if ($changes) {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "[$timestamp] Detected changes:" -ForegroundColor Yellow
        git status -s
        
        Write-Host "`n[$timestamp] Staging, committing, and pushing to GitHub..." -ForegroundColor Green
        git add .
        git commit -m "Auto update: $timestamp"
        git push origin main
        Write-Host "[$timestamp] Done! Pushed to origin main.`n" -ForegroundColor Cyan
    }
}
