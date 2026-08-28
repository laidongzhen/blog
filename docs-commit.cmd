@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 node，请先安装 Node.js 并确保在 PATH 中。
  pause
  exit /b 1
)

echo.
echo ========== 文档快捷提交 ==========
echo 仓库: %cd%
echo.

node scripts\docs-commit.mjs
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo 脚本退出码: %ERR%
) else (
  echo 完成。
)
pause
exit /b %ERR%
