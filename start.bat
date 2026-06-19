@echo off
title Sanji's All Blue - Startup
echo.
echo  ======================================
echo    Sanji's All Blue Restaurant
echo  ======================================
echo.

:: Check if pnpm is available, use npx fallback
where pnpm >nul 2>&1
if %errorlevel% == 0 (
  set PNPM=pnpm
) else (
  set PNPM=npx pnpm@9
)

:: Set working directory to the script's location
cd /d "%~dp0"

echo [1/2] Starting API server on port 5000...
start "All Blue - API Server" cmd /k "title API Server (port 5000) && %PNPM% --filter @workspace/api-server run start"

:: Give the API server a moment to boot before starting the frontend
timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend on port 5173...
start "All Blue - Frontend" cmd /k "title Frontend (port 5173) && %PNPM% --filter @workspace/all-blue run dev"

echo.
echo  Both servers are starting in separate windows.
echo.
echo  Frontend:  http://localhost:5173
echo  API:       http://localhost:5000
echo.
echo  (Close this window when you're done)
pause
