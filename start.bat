@echo off
cd /d "%~dp0"
title Israel-USA Relocation Hub (Server + Client)
echo Working directory: %CD%
echo Initializing SQLite database and starting Express API (:3001) + Vite Client (:5173)...
call npm run dev
