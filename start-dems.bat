@echo off
echo ========================================
echo Thailand DEMS - System Startup
echo ========================================
echo.

REM Kill any existing node processes
echo Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start backend server in new window
echo Starting backend server on port 5000...
start "DEMS Backend" cmd /k "cd /d C:\Users\phone\OneDrive\Desktop\DEMS\backend && node server-disaster.js"
timeout /t 3 /nobreak >nul

REM Start frontend server in new window
echo Starting frontend server on port 3000...
start "DEMS Frontend" cmd /k "cd /d C:\Users\phone\OneDrive\Desktop\DEMS\frontend && npm run dev"
timeout /t 5 /nobreak >nul

REM Open browser
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo ✅ DEMS is now running!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
