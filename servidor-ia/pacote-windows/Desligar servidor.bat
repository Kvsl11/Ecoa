@echo off
rem Desliga o servidor do Ecoa (o Python, o tunel e o ffmpeg que estao rodando desta pasta).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=(Resolve-Path '.').Path; Get-Process | Where-Object { $_.Path -and $_.Path.StartsWith($p, [StringComparison]::OrdinalIgnoreCase) } | Stop-Process -Force"
echo Servidor desligado.
timeout /t 3 >nul
