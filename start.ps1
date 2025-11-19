# Quiz App Startup Script for Windows PowerShell

Write-Host "🎯 Starting Quiz Application..." -ForegroundColor Cyan
Write-Host ""

# Get local IP address
$LOCAL_IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}).IPAddress | Select-Object -First 1

if (-not $LOCAL_IP) {
    Write-Host "⚠️  Warning: Could not detect local IP address" -ForegroundColor Yellow
    $LOCAL_IP = "localhost"
} else {
    Write-Host "🌐 Your local IP address: $LOCAL_IP" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Make sure you've set up the environment:" -ForegroundColor Yellow
Write-Host "   1. Run setup.ps1 to install all dependencies"
Write-Host "   2. (Optional) Create frontend\.env.local with: VITE_API_BASE=http://$($LOCAL_IP):8000"
Write-Host "   3. Create frontend\.env.local with: VITE_API_BASE=http://$($LOCAL_IP):8000"
Write-Host ""

# Start backend
$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "backend"
$venvPython = Join-Path $rootPath "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "❌ Virtual environment not found at $venvPython" -ForegroundColor Red
    Write-Host "   Please run: .\setup.ps1" -ForegroundColor Yellow
}

$backendJob = Start-Job -ScriptBlock {
    param($backendPath, $python)
    Set-Location $backendPath
    & $python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} -ArgumentList $backendPath, $venvPython

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🚀 Starting Frontend (React + Vite)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev -- --host 0.0.0.0
} -ArgumentList $frontendPath

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Quiz application is running!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 Access URLs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎤 PRESENTER (on this computer):" -ForegroundColor Yellow
Write-Host "   http://$($LOCAL_IP):5173?presenter=1"
Write-Host "   or http://localhost:5173?presenter=1"
Write-Host ""
Write-Host "👥 PARTICIPANTS (on phones/tablets):" -ForegroundColor Yellow
Write-Host "   http://$($LOCAL_IP):5173"
Write-Host "   (or scan the QR code shown on presenter screen)"
Write-Host ""
Write-Host "🔧 Backend API Docs:" -ForegroundColor Yellow
Write-Host "   http://$($LOCAL_IP):8000/docs"
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 TIP: Make sure all devices are on the same WiFi network!" -ForegroundColor Green
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if jobs are still running
        if ($backendJob.State -ne "Running" -or $frontendJob.State -ne "Running") {
            Write-Host "⚠️  One of the servers stopped unexpectedly" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}

