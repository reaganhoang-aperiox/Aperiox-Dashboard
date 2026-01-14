# Trading Dashboard - Full Stack Startup Script
# PowerShell version

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Trading Dashboard - Full Stack Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get the current directory
$rootPath = Get-Location

# Start Backend
Write-Host "[1/2] Starting Backend API Server..." -ForegroundColor Yellow
$backendPath = Join-Path $rootPath "api-meta-trader-4"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend API...' -ForegroundColor Green; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; Write-Host 'Starting Frontend Dashboard...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Servers Starting..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:  " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend:     " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Username: investor1" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Two new PowerShell windows have been opened." -ForegroundColor Cyan
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
