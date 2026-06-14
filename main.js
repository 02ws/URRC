/**
 * Electron 主进程 - WinUI 3 风格消消乐游戏
 * 功能:
 *  - 创建自定义窗口 (无边框 + 自定义标题栏)
 *  - 本地 Web 服务器加载游戏
 *  - 原生菜单和快捷键
 *  - 高分持久化
 */

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  shell,
  nativeImage,
  screen,
  Tray
} = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const os = require('os');

// 全局对象
let mainWindow = null;
let tray = null;
let localServer = null;

// 配置文件路径
const configPath = path.join(app.getPath('userData'), 'gems-config.json');

// 默认配置
const defaultConfig = {
  highScore: 0,
  totalGames: 0,
  totalGems: 0,
  bestCombo: 0,
  theme: 'light',
  windowSize: { width: 520, height: 900 },
  alwaysOnTop: false
};

/**
 * 读取配置文件
 */
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('[配置] 读取失败:', e.message);
  }
  return { ...defaultConfig };
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[配置] 保存失败:', e.message);
    return false;
  }
}

/**
 * 启动本地 HTTP 服务器，用于加载游戏文件
 * 端口: 5858 (随机自动重试)
 */
function startLocalServer() {
  return new Promise((resolve) => {
    const baseDir = __dirname;
    let port = 5858;

    const tryCreateServer = (portToTry) => {
      const server = http.createServer((req, res) => {
        try {
          // 解析请求路径
          const parsedUrl = url.parse(req.url);
          let filePath = decodeURIComponent(parsedUrl.pathname);

          // 默认文件
          if (filePath === '/' || filePath === '') {
            filePath = '/xiaoxiaole.html';
          }

          // 安全检查: 防止路径穿越
          if (filePath.includes('..') || filePath.includes('~')) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
          }

          const fullPath = path.join(baseDir, filePath);
          
          // 检查文件是否存在
          if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found: ' + filePath);
            return;
          }

          // 确定 MIME 类型
          const ext = path.extname(fullPath).toLowerCase();
          const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf'
          };

          const contentType = mimeTypes[ext] || 'application/octet-stream';

          // 读取并返回文件
          const fileContent = fs.readFileSync(fullPath);
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(fileContent);
        } catch (error) {
          console.error('[服务器] 错误:', error.message);
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
        }
      });

      // 尝试监听端口
      server.listen(portToTry, '127.0.0.1', () => {
        console.log(`[服务器] 已启动: http://127.0.0.1:${portToTry}`);
        resolve({ server, port: portToTry });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`[服务器] 端口 ${portToTry} 已占用，尝试 ${portToTry + 1}`);
          tryCreateServer(portToTry + 1);
        } else {
          console.error('[服务器] 启动失败:', err.message);
          resolve(null);
        }
      });
    };

    tryCreateServer(port);
  });
}

/**
 * 创建主窗口
 */
async function createWindow() {
  // 启动本地服务器
  const serverResult = await startLocalServer();
  if (serverResult) {
    localServer = serverResult.server;
  }

  // 加载配置
  const config = loadConfig();

  // 获取屏幕信息
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = config.windowSize.width || 520;
  const windowHeight = Math.min(config.windowSize.height || 900, height - 40);
  const windowX = Math.floor((width - windowWidth) / 2);
  const windowY = Math.floor((height - windowHeight) / 2);

  // 创建浏览器窗口（固定大小：520 × 900）
  mainWindow = new BrowserWindow({
    width: 520,
    height: 900,
    x: windowX,
    y: windowY,
    minWidth: 520,
    maxWidth: 520,
    minHeight: 900,
    maxHeight: 900,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#F3F3F3',
    title: '消消乐 · WinUI3',
    icon: path.join(__dirname, 'icon.ico'),
    frame: true,
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: config.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false
    }
  });

  // 加载游戏页面
  if (serverResult) {
    mainWindow.loadURL(`http://127.0.0.1:${serverResult.port}/xiaoxiaole.html`);
  } else {
    // 备用方案：直接加载文件
    mainWindow.loadFile(path.join(__dirname, 'xiaoxiaole.html'));
  }

  // 页面准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 创建系统托盘
 */
function createTray() {
  try {
    const iconPath = path.join(__dirname, 'icon.ico');
    
    // 创建简单的图标（如果文件不存在）
    let trayIcon;
    if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    } else {
      trayIcon = nativeImage.createEmpty();
    }

    tray = new Tray(trayIcon);
    tray.setToolTip('消消乐 · WinUI3');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: '置顶窗口',
        type: 'checkbox',
        checked: mainWindow ? mainWindow.isAlwaysOnTop() : false,
        click: (menuItem) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(menuItem.checked);
            const config = loadConfig();
            config.alwaysOnTop = menuItem.checked;
            saveConfig(config);
          }
        }
      },
      { type: 'separator' },
      {
        label: '在浏览器中打开',
        click: () => {
          shell.openExternal('http://127.0.0.1:5858/xiaoxiaole.html');
        }
      },
      {
        label: '打开游戏目录',
        click: () => {
          shell.openPath(__dirname);
        }
      },
      { type: 'separator' },
      {
        label: '关于 Gems',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于 Gems 消消乐',
            message: `Gems · 缤纷消消乐`,
            detail: `版本: ${app.getVersion()}\n\n一款 WinUI 3 风格的三消游戏。\n使用 Electron 构建。\n\n© ${new Date().getFullYear()} Gems Game Studio`,
            buttons: ['确定'],
            icon: trayIcon
          });
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.error('[托盘] 创建失败:', e.message);
  }
}

/**
 * 创建应用菜单
 */
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // 文件菜单
    {
      label: '文件',
      submenu: [
        {
          label: '重新开始游戏',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('game:restart');
            }
          }
        },
        { type: 'separator' },
        {
          label: '刷新页面',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    // 编辑菜单
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    // 视图菜单
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomLevel(0);
          }
        },
        { type: 'separator' },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        },
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    // 帮助菜单
    {
      label: '帮助',
      submenu: [
        {
          label: '游戏说明',
          accelerator: 'F1',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '游戏说明',
              message: '🎮 怎么玩?',
              detail:
                '1. 点击一个宝石选中它\n' +
                '2. 点击相邻宝石进行交换\n' +
                '3. 三个或更多相同宝石连成一线即可消除\n' +
                '4. 连锁消除可获得额外分数\n' +
                '5. 在步数耗尽前达到目标分数即可通关\n\n' +
                '快捷键:\n' +
                '  F1 - 显示帮助\n' +
                '  Ctrl+R - 重新开始\n' +
                '  F5 - 刷新页面\n' +
                '  F11 - 全屏\n' +
                '  F12 - 开发者工具',
              buttons: ['确定']
            });
          }
        },
        {
          label: '在浏览器中打开',
          click: () => {
            shell.openExternal('http://127.0.0.1:5858/xiaoxiaole.html');
          }
        },
        { type: 'separator' },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'Gems 消消乐',
              detail: `版本: ${app.getVersion()}\nElectron: ${process.versions.electron}\n\n使用 Electron 构建的 WinUI 3 风格三消游戏`,
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * IPC 通信处理 - 与前端交互
 */
function setupIPC() {
  // 获取配置
  ipcMain.handle('config:get', () => {
    return loadConfig();
  });

  // 保存配置
  ipcMain.handle('config:set', (event, newConfig) => {
    const currentConfig = loadConfig();
    const merged = { ...currentConfig, ...newConfig };
    return saveConfig(merged);
  });

  // 更新最高分
  ipcMain.handle('game:update-score', (event, scoreData) => {
    const config = loadConfig();
    let updated = false;

    if (scoreData.score > config.highScore) {
      config.highScore = scoreData.score;
      updated = true;
    }
    if (scoreData.gems) {
      config.totalGems += scoreData.gems;
    }
    if (scoreData.combo && scoreData.combo > config.bestCombo) {
      config.bestCombo = scoreData.combo;
    }
    config.totalGames++;

    saveConfig(config);
    return {
      success: true,
      isNewHighScore: updated,
      config: config
    };
  });

  // 获取最高分
  ipcMain.handle('game:get-high-score', () => {
    return loadConfig().highScore;
  });

  // 获取应用信息
  ipcMain.handle('app:get-info', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      configPath: configPath,
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData')
    };
  });

  // 在默认浏览器中打开
  ipcMain.handle('app:open-in-browser', () => {
    shell.openExternal('http://127.0.0.1:5858/xiaoxiaole.html');
    return true;
  });

  // 最小化窗口
  ipcMain.on('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  // 最大化/还原
  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    }
  });

  // 关闭窗口
  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  // 设置窗口置顶
  ipcMain.on('window:always-on-top', (event, flag) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(flag);
  });
}

/**
 * Electron 应用生命周期
 */

// 应用准备就绪
app.whenReady().then(() => {
  console.log(`[应用] ${app.getName()} v${app.getVersion()} 已启动`);
  console.log(`[应用] 平台: ${process.platform} | Node: ${process.versions.node} | Electron: ${process.versions.electron}`);
  console.log(`[应用] 配置路径: ${configPath}`);

  // 设置应用名称（任务栏显示）
  app.setName('消消乐');
  app.setAppUserModelId('消消乐');

  // 创建窗口、菜单、托盘
  createWindow();
  createMenu();

  // macOS 上显示 Dock 菜单
  if (process.platform === 'darwin') {
    // createTray();  // macOS 可选
  } else {
    createTray();
  }

  // 设置 IPC 通信
  setupIPC();

  // macOS: 当没有窗口时点击 Dock 图标重新创建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭后退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 清理本地服务器
    if (localServer) {
      try {
        localServer.close();
      } catch (e) {
        // 忽略
      }
    }
    app.quit();
  }
});

// 退出前清理
app.on('before-quit', () => {
  if (localServer) {
    try {
      localServer.close();
      console.log('[服务器] 已关闭');
    } catch (e) {
      // 忽略
    }
  }
});

// 禁用 GPU 崩溃时的警告
app.commandLine.appendSwitch('--disable-features', 'HardwareMediaKeyHandling');
