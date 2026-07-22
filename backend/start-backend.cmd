@echo off
echo Starting EduTrack Spring Boot Backend...
cd /d %~dp0

REM Check if mvn exists in PATH
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    mvn spring-boot:run
) else (
    echo [INFO] Maven (mvn) command not found in system PATH.
    echo Please install Apache Maven or use your IDE (IntelliJ IDEA / Eclipse / VS Code) to run EduTrackApplication.java.
    pause
)
