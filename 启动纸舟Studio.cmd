@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE="

if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
  goto run_app
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
  goto run_app
)

for /f "delims=" %%I in ('where node.exe 2^>nul') do (
  if not defined NODE_EXE set "NODE_EXE=%%I"
)

if not defined NODE_EXE (
  echo Node.js was not found.
  echo Install Node.js 20 or newer from https://nodejs.org/
  pause
  exit /b 1
)

:run_app
"%NODE_EXE%" "%~dp0server.mjs"
if errorlevel 1 pause
endlocal
