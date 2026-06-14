/**
 * Electron 预加载脚本
 * 在网页端 (contextIsolation: true)
 * 安全地暴露少量 Node.js API 到渲染进程
 */

const { contextBridge, ipcRenderer } = require('electron');

// 暴露给渲染进程的安全 API
contextBridge.exposeInMainWorld('electronAPI', {
  // ============ 配置管理 ============
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (config) => ipcRenderer.invoke('config:set', config),

  // ============ 游戏相关 ============
  updateScore: (scoreData) => ipcRenderer.invoke('game:update-score', scoreData),
  getHighScore: () => ipcRenderer.invoke('game:get-high-score'),

  // ============ 应用信息 ============
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
  openInBrowser: () => ipcRenderer.invoke('app:open-in-browser'),

  // ============ 窗口控制 ============
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('window:always-on-top', flag),

  // ============ 监听来自主进程的消息 ============
  onGameRestart: (callback) => {
    ipcRenderer.on('game:restart', () => callback());
  }
});

// 页面加载完成提示
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Preload] 预加载脚本已就绪');
  console.log('[Preload] electronAPI 已注入到 window 对象');
  
  // 可以在这里做额外的初始化工作
});
