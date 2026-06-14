@echo off
chcp 65001 >nul
title Gems 消消乐 - 打包为独立 EXE
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo   Gems 消消乐 - 打包为独立 EXE 安装程序
echo   基于 Electron Builder
echo ============================================================
echo.

rem ===== 检查 Node.js =====
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js！
    echo        请访问 https://nodejs.org 下载安装 LTS 版本。
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [信息] Node.js 版本: %NODE_VER%
echo.

rem ===== 配置国内镜像加速（自动检测，无需修改环境变量）=====
echo [配置] 正在设置 npm 国内镜像（加速下载）...
call npm config set registry https://registry.npmmirror.com >nul 2>nul
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
echo [完成] 已切换到 npmmirror 国内镜像
echo.

rem ===== 检查依赖 =====
if not exist "node_modules\electron" (
    echo [准备] 首次运行，正在安装 Electron 和打包工具（约 3-8 分钟）...
    echo        请耐心等待，首次下载包含运行时（约 200MB）。
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败！
        echo.
        echo 请尝试以下步骤：
        echo   1. 检查网络连接（国内镜像已自动配置）
        echo   2. 删除当前目录下的 node_modules 文件夹
        echo   3. 重新运行本脚本
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [完成] 依赖安装成功！
    echo.
) else (
    echo [信息] 已检测到依赖，跳过安装。
    echo.
)

rem ===== 显示菜单 =====
:menu
echo ============================================================
echo   请选择要打包的类型：
echo ============================================================
echo.
echo   [1] 便携版 + 安装程序（两者都生成）
echo   [2] 仅便携版 (Portable EXE) - 双击即可玩，无需安装
echo   [3] 仅安装程序 (NSIS Setup) - 标准 Windows 安装包
echo   [4] 先运行游戏预览一下（不打包）
echo   [5] 清理并重新安装依赖
echo   [0] 退出
echo.
set /p choice=请输入选项 [0-5]: 

if "%choice%"=="1" goto build-all
if "%choice%"=="2" goto build-portable
if "%choice%"=="3" goto build-nsis
if "%choice%"=="4" goto preview
if "%choice%"=="5" goto clean
if "%choice%"=="0" goto exit

echo.
echo [错误] 无效选项，请重新输入！
echo.
goto menu

rem ===== 各种打包模式 =====
:build-all
echo.
echo [构建] 正在生成便携版和安装程序...
echo [提示] 大约需要 2-5 分钟，首次会下载 NSIS 工具...
echo.
call npx --no-install electron-builder --win --x64
goto show-result

:build-portable
echo.
echo [构建] 正在生成便携版 (Portable EXE)...
echo [提示] 生成后可以直接拷贝到任何电脑运行。
echo.
call npx --no-install electron-builder --win portable --x64
goto show-result

:build-nsis
echo.
echo [构建] 正在生成 NSIS 安装程序...
echo.
call npx --no-install electron-builder --win nsis --x64
goto show-result

:preview
echo.
echo [启动] 正在启动游戏预览...
call npm start
goto exit

:clean
echo.
echo [清理] 删除 node_modules 和 dist 目录...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "dist" rmdir /s /q "dist"
if exist "package-lock.json" del /q "package-lock.json"
echo [完成] 已清理！准备重新运行本脚本安装依赖。
echo.
pause
goto exit

:show-result
echo.
echo ============================================================
if exist "dist" (
    echo [成功] ✓ 构建完成！
    echo.
    echo 生成的文件位于: "%~dp0dist"
    echo.
    echo --- 文件列表 ---
    dir /b dist\*.exe 2>nul
    echo.
    echo 按任意键打开 dist 文件夹...
    pause >nul
    explorer dist
) else (
    echo [提示] 构建完成但未找到 dist 目录。
    echo        请检查上方输出，可能有错误。
    echo.
    pause
)

:exit
endlocal
