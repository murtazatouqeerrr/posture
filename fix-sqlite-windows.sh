#!/bin/bash
echo "Fixing SQLite3 for Windows..."

# Remove existing node_modules and package-lock
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Rebuild SQLite3 specifically for current platform
npm rebuild sqlite3 --build-from-source

echo "SQLite3 fixed!"
echo "You can now run: npm start"
