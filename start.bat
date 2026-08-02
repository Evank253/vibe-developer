@echo off
REM =====================================================================
REM  VibeDev - one-click start (Windows)
REM  Usage: double-click start.bat   (or run it from a terminal)
REM =====================================================================
setlocal
cd /d "%~dp0"           REM always run from the vibedev folder

echo.
echo  VibeDev - starting...

REM --- 1. Backend dependencies ---
if not exist "node_modules" (
    echo  ^> Installing backend dependencies...
    call npm install
) else (
    echo  ^> Backend dependencies present
)

REM --- 2. Frontend dependencies ---
if not exist "client\node_modules" (
    echo  ^> Installing frontend dependencies...
    call npm --prefix client install
) else (
    echo  ^> Frontend dependencies present
)

REM --- 3. Build the frontend (only first time) ---
if not exist "client\dist\index.html" (
    echo  ^> Building frontend...
    call npm run build:client
) else (
    echo  ^> Frontend already built
)

REM --- 4. Start the server ---
echo  ^> Starting server...
echo   Open http://localhost:4000 in your browser
echo.

call npm start

endlocal
