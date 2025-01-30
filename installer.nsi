!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

; Define application name and version
Name "EyeNet Protocol Initialization"
OutFile "dist\EyeNet-Protocol-Setup.exe"
InstallDir "$PROGRAMFILES64\EyeNet Protocol"

; Request admin privileges
RequestExecutionLevel admin

; Variables for server key and gateway
Var Dialog
Var ServerKeyLabel
Var ServerKeyText
Var GatewayLabel
Var GatewayText
Var ServerKey
Var Gateway

; Modern UI settings
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
Page custom ServerKeyGatewayPage ServerKeyGatewayPageLeave
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

; Custom page for server key and gateway
Function ServerKeyGatewayPage
    nsDialogs::Create 1018
    Pop $Dialog

    ${If} $Dialog == error
        Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 0 100% 12u "Please enter your Server Key:"
    Pop $ServerKeyLabel

    ${NSD_CreateText} 0 13u 100% 12u ""
    Pop $ServerKeyText

    ${NSD_CreateLabel} 0 30u 100% 12u "Please enter your Gateway Address:"
    Pop $GatewayLabel

    ${NSD_CreateText} 0 43u 100% 12u ""
    Pop $GatewayText

    nsDialogs::Show
FunctionEnd

Function ServerKeyGatewayPageLeave
    ${NSD_GetText} $ServerKeyText $ServerKey
    ${NSD_GetText} $GatewayText $Gateway
    
    ${If} $ServerKey == ""
        MessageBox MB_OK|MB_ICONEXCLAMATION "Please enter a Server Key"
        Abort
    ${EndIf}
    
    ${If} $Gateway == ""
        MessageBox MB_OK|MB_ICONEXCLAMATION "Please enter a Gateway Address"
        Abort
    ${EndIf}
FunctionEnd

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    
    ; Stop and remove existing service if it exists
    ExecWait 'net stop "EyeNet Protocol"'
    ExecWait '$INSTDIR\eyenet-windows-agent.exe --remove'
    
    ; Copy files
    File "dist\eyenet-windows-agent.exe"
    
    ; Create config directory
    CreateDirectory "$INSTDIR\config"
    
    ; Create config file
    FileOpen $0 "$INSTDIR\config\config.json" w
    FileWrite $0 '{$\n'
    FileWrite $0 '  "serverkey": "$ServerKey",$\n'
    FileWrite $0 '  "gateway": "$Gateway"$\n'
    FileWrite $0 '}$\n'
    FileClose $0
    
    ; Create logs directory
    CreateDirectory "$INSTDIR\logs"
    
    ; Install and start service
    ExecWait '"$INSTDIR\eyenet-windows-agent.exe" --add'
    ExecWait 'net start "EyeNet Protocol"'
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Create start menu shortcuts
    CreateDirectory "$SMPROGRAMS\EyeNet Protocol"
    CreateShortcut "$SMPROGRAMS\EyeNet Protocol\Uninstall.lnk" "$INSTDIR\uninstall.exe"
    
    ; Add uninstall information to Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EyeNet Protocol" \
                     "DisplayName" "EyeNet Protocol"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EyeNet Protocol" \
                     "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EyeNet Protocol" \
                     "Publisher" "EyeNet"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EyeNet Protocol" \
                     "URLInfoAbout" "https://eyenet.hacktivators.com"
SectionEnd

Section "Uninstall"
    ; Stop and remove service
    ExecWait 'net stop "EyeNet Protocol"'
    ExecWait '$INSTDIR\eyenet-windows-agent.exe --remove'
    
    ; Remove files
    Delete "$INSTDIR\eyenet-windows-agent.exe"
    Delete "$INSTDIR\config\config.json"
    Delete "$INSTDIR\uninstall.exe"
    
    ; Remove directories
    RMDir "$INSTDIR\config"
    RMDir "$INSTDIR\logs"
    RMDir "$INSTDIR"
    
    ; Remove start menu items
    Delete "$SMPROGRAMS\EyeNet Protocol\Uninstall.lnk"
    RMDir "$SMPROGRAMS\EyeNet Protocol"
    
    ; Remove uninstall information
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EyeNet Protocol"
SectionEnd
