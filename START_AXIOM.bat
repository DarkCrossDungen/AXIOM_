@echo off
title AXIOM Studio v2.0 — Starting...
color 0A
cls
echo.
echo  ================================================
echo       AXIOM STUDIO ENGINE v2.0
echo       AI-Powered Design + 3D + PPT Platform
echo  ================================================
echo.
echo  [1/3] Checking Python...

python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: Python is not installed!
    echo  Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b
)

echo  [2/3] Installing Python dependencies...
pip install -r requirements.txt -q >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  WARNING: Some dependencies may not have installed.
    echo  Continuing anyway...
)

echo  [3/3] Launching AXIOM Studio on http://localhost:8080
echo.
echo  ================================================
echo   Your browser will open automatically.
echo   To stop, press Ctrl+C or close this window.
echo  ================================================
echo.

python main.py

pause
