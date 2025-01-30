@echo off

goto check_Permissions

:check_Permissions

    net session >nul 2>&1
    if %ERRORLEVEL% == 0 (

        echo Stopping nMon Agent Service
        net stop "nMon Agent"

        echo Removing nMon Agent Service
        %~dp0nodejs\node.exe %~dp0service.js --remove

        echo Done

    ) else (
        echo Failure: Administrative permissions required.
        echo Right click on this file and select "Run as administrator".
    )

    pause >nul
