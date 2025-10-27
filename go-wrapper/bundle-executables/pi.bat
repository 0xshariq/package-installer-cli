@echo off
setlocal
set "DIR=%~dp0"
node "%DIR%cli-with-packages.js" %*
exit /b %ERRORLEVEL%
