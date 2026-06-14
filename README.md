# 💎 FluentGems · Fluent Design 风格消消乐

一款使用 **HTML/CSS/JavaScript** 开发的经典三消游戏，采用 Windows 11 Fluent Design 风格，通过 **Electron** 打包为桌面应用。

<p align="center">
  <img src="https://img.shields.io/badge/平台-Windows-blue?style=for-the-badge&logo=windows" />
  <img src="https://img.shields.io/badge/技术-Electron-47848F?style=for-the-badge&logo=electron" />
  <img src="https://img.shields.io/badge/语言-HTML%2FCSS%2FJS-E34F26?style=for-the-badge&logo=html5" />
  <img src="https://img.shields.io/badge/风格-Fluent%20Design-0078D4?style=for-the-badge" />
</p>

---

## ✨ 特性

- 🎨 **WinUI 3 / Fluent Design** —— 原生 Windows 11 视觉风格
- 🌙 **浅色 / 深色主题** —— 一键切换，自动适配界面元素
- 🌐 **中文 / English 双语** —— 菜单和提示即时切换
- 💎 **6 种宝石** —— 心形、钻石、幸运草、星星、魔球、花朵
- 🎮 **8×8 游戏棋盘** —— 流畅的点击交换消除机制
- 🔥 **连击系统** —— 连续触发消除获得额外奖励
- 📊 **分数与关卡** —— 目标分数、进度条、步数限制
- 💡 **智能提示** —— 找不到可消除组合时自动提示
- 🔀 **自动重排** —— 死局时自动洗牌
- 📦 **Electron 打包** —— 一键生成 exe 安装包

---

## 🚀 快速开始

### 方式一：下载安装包（推荐）

直接前往 **[Releases 页面](https://github.com/02ws/FluentGems/releases)** 下载最新版：

| 版本 | 说明 |
|------|------|
| `FluentGems X.X.X.exe` | 免安装版，双击即可运行 |
| `FluentGems Setup X.X.X.exe` | 安装版，安装到电脑 |

---

### 方式二：从源码运行

#### 前置条件

- [Node.js](https://nodejs.org/) 16+
- [Git](https://git-scm.com/)

#### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/02ws/FluentGems.git
cd FluentGems

# 2. 安装依赖
npm install

# 3. 启动游戏
npm start
```

---

### 方式三：打包为 exe

```bash
# 打包为 安装版 + 免安装版
npm run build

# 打包产物位于 dist/ 目录
#   dist/FluentGems Setup 1.0.0.exe   (安装版)
#   dist/FluentGems 1.0.0.exe         (免安装版)
```

---

## 🎮 游戏玩法

1. **点击选中** 一颗宝石（高亮显示）
2. **再点击相邻宝石** 进行交换
3. 交换后如果能形成 **3 个或以上同色宝石一排**，则消除并得分
4. 无法消除的交换会自动还原
5. 消除后新宝石从顶部落下，可能触发连锁消除
6. 在步数用完前达到目标分数即可过关
7. 遇到死局（无任何可消除组合）会自动重排棋盘

---

## 🖼️ 界面预览

```
┌──────────────────────────────┐
│  ≡  FluentGems        ☀ 🌐   │  ← 菜单 / 主题切换 / 语言切换
├──────────────────────────────┤
│  当前分数                      │
│  ░░░░░░░░░░░░░░  827 / 1000   │  ← 进度条
├──────────────────────────────┤
│  步数 30  | 消除 0  | 连击 ×0 │  ← 状态栏
├──────────────────────────────┤
│  💎 💎 ❤️ 🍀 ⭐ 🔮 💖 ⭐  │
│  ❤️ 🍀 💎 ⭐ ❤️ 💖 ⭐ 🔮  │  ← 8×8 棋盘
│  🍀 ⭐ ❤️ 💖 🔮 💎 ⭐ ❤️  │
│  ⭐ 🔮 💖 ⭐ ❤️ 🍀 💎 ⭐  │
│  💖 ⭐ 🔮 ⭐ ❤️ 💎 🍀 ⭐  │
│  ⭐ ❤️ 🍀 💎 ⭐ 🔮 💖 ⭐  │
│  🔮 💖 ⭐ ❤️ 💎 ⭐ 🍀 ⭐  │
│  ⭐ ⭐ ⭐ 🔮 🍀 ❤️ 💖 ⭐  │
├──────────────────────────────┤
│  💡 提示   🔀 重排   ↻ 重新开始 │  ← 底部命令栏
└──────────────────────────────┘
```

---

## 🛠️ 项目结构

```
FluentGems/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
├── xiaoxiaole.html      # 游戏主界面 (HTML + CSS + JS 一体式)
├── package.json         # 项目配置
├── icon.ico             # 应用图标
├── icon.png             # 应用图标 (PNG)
├── icon-256.png         # 应用图标 (256px)
├── 启动游戏.bat          # Windows 快捷启动脚本
├── 打包.bat              # Windows 快捷打包脚本
├── .gitignore           # Git 忽略文件
└── dist/                # 打包产物 (由 electron-builder 生成)
    ├── FluentGems 1.0.0.exe
    ├── FluentGems Setup 1.0.0.exe
    └── win-unpacked/
```

---

## ⚙️ 技术栈

| 分类 | 技术 |
|------|------|
| 桌面容器 | **Electron** |
| UI 渲染 | **HTML5 + CSS3** |
| 游戏逻辑 | **原生 JavaScript (ES6+)** |
| 设计语言 | **Fluent Design / WinUI 3** |
| 构建工具 | **electron-builder** |
| 主题系统 | **CSS 自定义属性 (CSS Variables)** |
| 多语言 | **i18n Map + DOM 动态替换** |

---

## 🔑 关键实现

### 主题切换

```css
/* 浅色 */
:root {
  --button-bg: #FBFBFB;
  --card-bg: #FFFFFF;
  --text-primary: rgba(0, 0, 0, 0.89);
}

/* 深色 */
[data-theme="dark"] {
  --button-bg: #2B2B2B;
  --card-bg: #2B2B2B;
  --text-primary: rgba(255, 255, 255, 0.92);
}
```

```js
function switchTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
```

### 消除算法

- 横向扫描 + 纵向扫描检测 ≥3 同色宝石
- BFS 搜索相邻同类宝石进行合并
- 重力下落 → 顶部补充新宝石 → 递归检测连锁

---

## 📝 开发笔记

- 游戏逻辑与 UI 渲染分离，维护成本低
- 无需任何第三方前端框架，体积小、启动快
- 打包后的 exe 约 130MB（含 Electron 运行时）
- 兼容 Windows 10 / Windows 11

---

## 📜 License

MIT License —— 自由使用、修改、分发

---

<p align="center">
  <br>
  用 ❤️ 打造 · Made with Fluent Design
  <br><br>
  <sub>如果这个项目对你有帮助，点个 Star ⭐ 就是最大的鼓励！</sub>
</p>
