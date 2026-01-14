@echo off
echo ==========================================
echo  Trading Dashboard - Full Stack Startup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Start Backend
echo [1/2] Starting Backend API Server...
start "MT4 API Backend" cmd /k "cd api-meta-trader-4&& npm start"
timeout /t 3 >nul

REM Start Frontend
echo [2/2] Starting Frontend Dashboard...
start "Trading Dashboard Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo  Servers Starting...
echo ==========================================
echo.
echo Backend API:  http://localhost:3001
echo Frontend:     http://localhost:5173
echo.
echo Login Credentials:
echo   Username: investor1
echo   Password: password123
echo.
echo Press any key to close this window...
pause >nul
