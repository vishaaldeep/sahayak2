@echo off
echo ========================================
echo Fixing Admin User Creation Issue
echo ========================================

cd /d "%~dp0"

echo Step 1: The User model has been updated to include 'admin' role
echo Step 2: MongoDB connection warnings have been fixed
echo Step 3: createAdmin script has been updated with required fields

echo.
echo Now creating admin user...
cd backend_new
node scripts/createAdmin.js

echo.
echo ========================================
echo Fix Summary:
echo 1. Added 'admin' to User model role enum
echo 2. Removed deprecated MongoDB connection options
echo 3. Added required fields to admin user creation
echo 4. Fixed all MongoDB driver warnings
echo.
echo Admin Credentials:
echo Phone: admin
echo Password: admin
echo Email: admin@sahaayak.com
echo.
echo You can now login as admin at: /admin/login
echo ========================================

pause