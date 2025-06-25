@echo off
echo.
echo ===============================================
echo   AirSafe App - Modo Offline Local
echo ===============================================
echo.
echo Iniciando la aplicacion en modo offline...
echo - Sin actualizaciones remotas
echo - Solo desarrollo local
echo - Cache limpio
echo.

cd /d "%~dp0"
npx expo start --offline --clear --no-dev

pause
