@echo off
cd /d "%~dp0"
echo Instalando e ligando o frontend. Aguarde...
call npm install
call npm run dev
pause
