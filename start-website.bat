@echo off
title Plain Walls - Gallery Server & MongoDB Live Sync
echo ===================================================
echo   Starting Plain Walls Server with MongoDB...
echo ===================================================
echo.
echo   MongoDB Database:    plain_walls
echo   Compass Connection:  mongodb://localhost:27017
echo   Website URL:         http://localhost:3000
echo   DB Manager:          http://localhost:3000/admin
echo.
echo Launching your browser at http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Server is running! Keep this window open while using the website.
echo Press Ctrl+C or close this window to stop the server.
echo.
npm start
pause
