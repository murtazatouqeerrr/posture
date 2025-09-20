@echo off
echo Fixing SQLite3 for Windows...

REM Remove existing node_modules and package-lock
rmdir /s /q node_modules
del package-lock.json

REM Clear npm cache
npm cache clean --force

REM Install dependencies for Windows
npm install

REM Rebuild SQLite3 specifically for Windows
npm rebuild sqlite3 --build-from-source

echo SQLite3 fixed for Windows!
echo You can now run: npm start
pause
