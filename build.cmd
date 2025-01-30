@echo off
echo Building EyeNet Agent...

rem Create dist directory if it doesn't exist
if not exist dist mkdir dist

rem Build the executables
call npm run build

rem Build the installer
"C:\Program Files (x86)\NSIS\makensis.exe" installer.nsi

echo Build completed! The installer is at dist\EyeNetAgent-Setup.exe
pause
