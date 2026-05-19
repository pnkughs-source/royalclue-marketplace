@echo off
echo Opening Bemady frontend on local server...
echo.
echo If Python is installed, site will open at:
echo http://127.0.0.1:5500/index.html
echo.
python -m http.server 5500
pause
