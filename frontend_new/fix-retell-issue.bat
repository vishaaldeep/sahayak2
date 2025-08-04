@echo off
echo Fixing Retell SDK issue...
cd /d "%~dp0"

echo Step 1: Cleaning npm cache...
npm cache clean --force

echo Step 2: Installing dependencies...
npm install

echo Step 3: If retell package still causes issues, we'll create a mock...
echo Check if the build works now by running: npm start

pause