@echo off
echo Installing frontend dependencies...
cd /d "%~dp0"
npm cache clean --force
npm install
echo Dependencies installation completed!
pause