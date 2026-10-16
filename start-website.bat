@echo off
title NovaMart E-Commerce Server & MongoDB Compass Live Sync
echo ===================================================================
echo   Starting NovaMart Full-Stack E-Commerce Server with MongoDB...
echo ===================================================================
echo.
echo   MongoDB Database:    ecommerce_db
echo   Compass Connection:  mongodb://localhost:27017
echo   Website URL:         http://localhost:3000
echo   Order Tracker:       http://localhost:3000/tracking
echo.
echo Launching your web browser at http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Server is running! Keep this command window open while using the website.
echo Press Ctrl+C or close this window to stop the server.
echo.
npm start
pause
