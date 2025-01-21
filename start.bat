@echo off
cd /d "%~dp0"
start cmd /k "node server.js"
start index.html
exit