@echo off
rem Liga o servidor do Ecoa neste computador, sem instalar nada (o pacote ja traz tudo dentro desta pasta).
rem Roda com prioridade baixa e usando metade dos processadores: o Windows da preferencia aos seus programas.
rem Fechar esta janela desliga o servidor.
chcp 65001 >nul
cd /d "%~dp0"
title Servidor do Ecoa
set "RAIZ=%~dp0"
if not exist "%RAIZ%python\python.exe" (
  echo Nao achei a pasta python. Descompacte o Ecoa-Servidor.zip inteiro e rode de novo.
  pause
  exit /b 1
)
set "TORCH_HOME=%RAIZ%modelos\torch"
set "HF_HOME=%RAIZ%modelos\huggingface"
set "XDG_CACHE_HOME=%RAIZ%modelos\cache"
set "IA_MODELOS_SEPARACAO=%RAIZ%modelos\separacao"
set "PYTHONUTF8=1"
set "PYTHONUNBUFFERED=1"
set /a METADE=%NUMBER_OF_PROCESSORS%/2
if %METADE% LSS 1 set METADE=1
if not defined IA_THREADS set "IA_THREADS=%METADE%"
start "Servidor do Ecoa" /belownormal /b /wait "%RAIZ%python\python.exe" "%RAIZ%servidor\pacote-windows\pacote.py"
if errorlevel 1 pause
