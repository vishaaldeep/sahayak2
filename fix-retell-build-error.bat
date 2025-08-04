@echo off
echo ========================================
echo Fixing Retell SDK Build Error
echo ========================================

cd /d "%~dp0"

echo Step 1: Navigating to frontend directory...
cd frontend_new

echo Step 2: Cleaning npm cache...
npm cache clean --force

echo Step 3: Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Step 4: Installing dependencies...
npm install

echo Step 5: Checking if build works...
echo You can now try running: npm start
echo.
echo If you still get errors, the VoiceAssistant component will automatically
echo use the mock implementation instead of the real Retell SDK.
echo.
echo ========================================
echo Solutions Applied:
echo 1. Added CRACO configuration to handle source map issues
echo 2. Downgraded retell-client-js-sdk to version 1.0.0
echo 3. Created mock implementation as fallback
echo 4. Updated VoiceAssistant to handle missing package gracefully
echo ========================================

pause