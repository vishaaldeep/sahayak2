@echo off
echo ========================================
echo Creating Admin User for Sahayak Platform
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Running createAdmin script...
node scripts/createAdmin.js

echo.
echo ========================================
echo Admin user creation completed!
echo.
echo Default admin credentials:
echo Phone: admin
echo Password: admin
echo Email: admin@sahaayak.com
echo ========================================

pause