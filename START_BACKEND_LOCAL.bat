@echo off
cd backend
echo Installing backend packages...
call npm install
echo Starting backend at http://localhost:5000
call npm run dev
pause
