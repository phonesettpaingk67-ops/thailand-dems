@echo off
echo ============================================
echo Installing Shelter Status Triggers
echo ============================================
echo.

cd /d "%~dp0backend"

echo Installing triggers into disaster_management_db database...
echo.

mysql -u root -p disaster_management_db < "db\shelter-status-triggers.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Shelter triggers installed.
    echo ============================================
    echo.
    echo The following triggers are now active:
    echo  - update_shelter_status_insert
    echo  - update_shelter_status_update
    echo.
    echo Shelters will automatically update their status based on occupancy.
    echo.
) else (
    echo.
    echo ============================================
    echo ERROR! Installation failed.
    echo ============================================
    echo.
    echo Please check:
    echo  1. MySQL is running
    echo  2. Database 'disaster_management_db' exists
    echo  3. You entered the correct password
    echo.
)

pause
