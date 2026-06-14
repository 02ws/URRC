@echo off
chcp 65001 >nul
title Gems 消消乐 - 启动游戏
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo   Gems 消消乐 - WinUI 3 风格桌面游戏
echo ============================================================
echo.

rem ===== 检查 Node.js =====
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请按以下步骤操作：
    echo   1. 访问 https://nodejs.org 下载 LTS 版本
    echo   2. 安装后重新打开本脚本
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [信息] Node.js: %NODE_VER%
echo.

rem ===== 配置国内镜像 =====
echo [配置] 设置 npm 国内镜像加速...
call npm config set registry https://registry.npmmirror.com >nul 2>nul
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
echo [完成] ✓
echo.

rem ===== 检查并安装依赖 =====
if not exist "node_modules\electron" (
    echo [安装] 首次运行，正在下载 Electron 运行时...
    echo        大约需要 1-5 分钟（200MB），请耐心等待。
    echo.
    echo [提示] 如果长时间卡住，请检查网络或按 Ctrl+C 中断后重试。
    echo.
    echo ------------------------------------------------------------
    call npm install
    set INSTALL_ERROR=!errorlevel!
    echo ------------------------------------------------------------
    if !INSTALL_ERROR! neq 0 (
        echo.
        echo [错误] 依赖安装失败！错误代码: !INSTALL_ERROR!
        echo.
        echo 解决方案:
        echo   1. 删除 "node_modules" 文件夹后重试
        echo   2. 删除 "package-lock.json" 后重试
        echo   3. 确认网络正常（已自动配置国内镜像）
        echo.
        echo 按任意键退出...
        pause >nul
        exit /b 1
    )
    echo.
    echo [完成] ✓ 依赖安装成功！
    echo.
) else (
    echo [信息] ✓ 已检测到依赖，跳过安装。
    echo.
)

rem ===== 启动游戏 =====
echo [启动] 正在启动 Gems 消消乐...
echo.
echo ============================================================
echo   快捷键:  F1=帮助  F5=刷新  F11=全屏  F12=开发者工具
echo ============================================================
echo.
echo [提示] 关闭游戏窗口即可退出。
echo.

call npx --no-install electron .
set EXIT_CODE=!errorlevel!

echo.
if !EXIT_CODE! equ 0 (
    echo [完成] ✓ 游戏已正常退出，感谢游玩！
) else (
    echo [提示] 游戏已退出（代码: !EXIT_CODE!）
)
echo.

pause
endlocal
