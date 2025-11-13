# 开发文档

## 📋 目录

- [快速开始](#快速开始)
- [NPM 脚本命令说明](#npm-脚本命令说明)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [测试](#测试)
- [部署](#部署)

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 构建 WASM 核心库
pnpm build

# 构建所有演示项目
pnpm build:demos

# 运行开发服务器（Vite Demo）
pnpm dev

# 提交前快速测试（推荐）
pnpm ok
```

## 📜 NPM 脚本命令说明

### 🔥 常用命令

#### `pnpm ok` ⭐

**用途**：提交代码前的快速检查  
**执行内容**：

1. 代码格式检查和修复（ESLint）
2. 构建 WASM 核心库
3. 运行 E2E 测试

**何时使用**：**每次提交代码前务必执行**，确保代码质量和功能正常。

```bash
pnpm ok
```

#### `pnpm dev`

**用途**：启动 Vite Demo 开发服务器  
**端口**：http://localhost:3000  
**自动准备**：会自动复制最新的 WASM 文件到 vite-demo

```bash
pnpm dev
```

#### `pnpm dev:e2e`

**用途**：启动 E2E Test Demo 开发服务器  
**端口**：http://localhost:3000  
**自动准备**：会自动复制最新的 WASM 文件到 e2e-demo

```bash
pnpm dev:e2e
```

#### `pnpm dev:nextjs`

**用途**：启动 Next.js Demo 开发服务器  
**端口**：http://localhost:3000  
**自动准备**：会自动复制最新的 WASM 文件到 nextjs-demo

```bash
pnpm dev:nextjs
```

#### `pnpm dev:node`

**用途**：启动 Node.js Demo（观察模式）  
**说明**：用于测试 Node.js 环境下的 UnRAR 功能

```bash
pnpm dev:node
```

#### `pnpm node-demo`

**用途**：运行 Node.js Demo  
**示例**：

```bash
pnpm node-demo path/to/file.rar ./output
```

### 🏗️ 构建命令

#### `pnpm build`

**用途**：构建 WASM 核心库（@unrar-browser/core）  
**输出**：`packages/unrar-wasm/build/`  
**包含**：

- `unrar.js` - WASM 加载器
- `unrar.wasm` - WebAssembly 二进制文件

```bash
pnpm build
```

#### `pnpm build:demos`

**用途**：构建所有演示项目  
**执行流程**：

1. `prepare:e2e` - 复制 WASM 文件到 e2e-demo
2. `prepare:vite-demo` - 复制 WASM 文件到 vite-demo
3. `prepare:nextjs-demo` - 复制 WASM 文件到 nextjs-demo
4. 构建 vite-demo
5. 构建 e2e-demo
6. 构建 nextjs-demo

```bash
pnpm build:demos
```

### 📦 准备命令（Prepare）

这些命令用于将最新的 WASM 文件复制到各个演示项目的 `public/` 目录。

#### `pnpm prepare:e2e`

复制 WASM 文件到 `packages/e2e-demo/public/`

#### `pnpm prepare:vite-demo`

复制 WASM 文件到 `packages/vite-demo/public/`

#### `pnpm prepare:nextjs-demo`

复制 WASM 文件到 `packages/nextjs-demo/public/`

> **注意**：`predev:*` 和 `pretest:e2e` 会自动调用相应的 prepare 命令，通常不需要手动执行。

### 🧪 测试命令

#### `pnpm test`

**用途**：运行所有测试  
**包含**：

- 单元测试（Jest）
- Web 测试（JSDOM）
- E2E 测试（Playwright）

```bash
pnpm test
```

#### `pnpm test:unit`

**用途**：运行单元测试  
**框架**：Jest

```bash
pnpm test:unit
```

#### `pnpm test:web`

**用途**：运行 Web 环境测试  
**框架**：Jest + JSDOM

```bash
pnpm test:web
```

#### `pnpm test:e2e`

**用途**：运行端到端测试  
**框架**：Playwright  
**浏览器**：Chromium, Firefox, WebKit  
**自动准备**：会自动复制最新的 WASM 文件到 e2e-demo

```bash
pnpm test:e2e
```

### 🎨 代码质量命令

#### `pnpm lint`

**用途**：检查并自动修复代码格式问题  
**工具**：ESLint

```bash
pnpm lint
```

#### `pnpm format`

**用途**：格式化代码  
**工具**：Prettier  
**范围**：所有 `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.md`, `.json`, `.yml`, `.yaml` 文件

```bash
pnpm format
```

### 🌐 GitHub Pages 部署命令

#### `pnpm ci:pages`

**用途**：构建并准备 GitHub Pages 部署内容  
**执行流程**：

1. `ci:pages:init` - 清空并初始化 `gh-pages/` 目录，创建 `.nojekyll`
2. `ci:pages:build` - 构建核心库和所有演示项目
3. `ci:pages:copy:vite-demo` - 复制 vite-demo 到 `gh-pages/vite-demo/`
4. `ci:pages:copy:nextjs-demo` - 复制 nextjs-demo 到 `gh-pages/nextjs-demo/`
5. `ci:pages:copy:e2e-demo` - 复制 e2e-demo 到 `gh-pages/e2e-demo/`

**输出目录结构**：

```
gh-pages/
├── .nojekyll
├── vite-demo/
│   ├── assets/
│   ├── index.html
│   ├── unrar.js
│   └── unrar.wasm
├── nextjs-demo/
│   ├── _next/
│   ├── index.html
│   ├── unrar.js
│   └── unrar.wasm
└── e2e-demo/
    ├── assets/
    ├── index.html
    ├── encryption.rar
    ├── unrar.js
    └── unrar.wasm
```

```bash
pnpm ci:pages
```

#### `pnpm ci:coverage`

**用途**：CI 环境下的测试覆盖率检查  
**执行**：构建 + E2E 测试（仅 Chromium）

```bash
pnpm ci:coverage
```

#### `pnpm ci:build`

**用途**：CI 环境下的构建  
**执行**：构建核心库

```bash
pnpm ci:build
```

#### `pnpm ci`

**用途**：完整的 CI 检查流程  
**执行**：代码检查 + 构建 + E2E 测试（仅 Chromium）

```bash
pnpm ci
```

### 🔧 其他命令

#### `pnpm commit`

**用途**：使用交互式提交工具提交代码  
**工具**：Commitizen  
**规范**：Conventional Commits

```bash
pnpm commit
```

#### `pnpm postinstall`

**用途**：安装依赖后的自动执行脚本  
**说明**：自动执行，无需手动运行

#### `pnpm preinstall`

**用途**：安装依赖前的检查脚本  
**说明**：自动执行，无需手动运行

## 📁 项目结构

```
unrar-browser-wasm/
├── packages/
│   ├── unrar-wasm/          # 核心 WASM 库
│   │   ├── src/
│   │   ├── build/           # WASM 构建输出
│   │   └── vendor/unrar/    # UnRAR 源代码
│   ├── vite-demo/           # Vite + React 演示
│   │   ├── public/          # 静态资源（包含 WASM 文件）
│   │   └── dist/            # 构建输出
│   ├── nextjs-demo/         # Next.js 演示
│   │   ├── public/          # 静态资源（包含 WASM 文件）
│   │   └── out/             # 构建输出
│   ├── e2e-demo/            # E2E 测试演示
│   │   ├── public/          # 静态资源（包含 WASM 文件和测试文件）
│   │   └── dist/            # 构建输出
│   └── node-demo/           # Node.js 演示
│       └── encryption.rar   # 测试文件（带密码）
├── __tests__/               # 单元测试
├── __webtests__/            # Web 测试
├── __e2etests__/            # E2E 测试
├── gh-pages/                # GitHub Pages 部署目录
└── .github/workflows/       # GitHub Actions 配置
```

## 🔄 开发工作流

### 日常开发

1. **修改核心库代码**（`packages/unrar-wasm/src/`）

```bash
# 重新构建 WASM
pnpm build

# 测试更改
pnpm dev  # 或 pnpm dev:e2e, pnpm dev:nextjs
```

2. **修改演示项目代码**

```bash
# 直接启动对应的开发服务器
pnpm dev           # Vite Demo
pnpm dev:e2e       # E2E Demo
pnpm dev:nextjs    # Next.js Demo
```

3. **提交前检查**

```bash
# 运行完整检查（必须！）
pnpm ok

# 如果通过，提交代码
git add .
pnpm commit  # 或 git commit
```

### 添加新功能流程

1. **编写代码**
2. **编写测试**（`__tests__/`, `__webtests__/`, `__e2etests__/`）
3. **本地测试**

```bash
pnpm test:unit     # 单元测试
pnpm test:web      # Web 测试
pnpm test:e2e      # E2E 测试
```

4. **代码检查**

```bash
pnpm lint          # 检查并修复代码格式
pnpm format        # 格式化代码
```

5. **提交前检查**

```bash
pnpm ok            # 完整检查
```

6. **提交代码**

```bash
pnpm commit        # 交互式提交
```

### 发布流程

1. **确保所有测试通过**

```bash
pnpm ok
```

2. **构建所有项目**

```bash
pnpm build
pnpm build:demos
```

3. **准备 GitHub Pages 部署**

```bash
pnpm ci:pages
```

4. **手动触发 GitHub Actions**  
   访问：https://github.com/DavidKk/unrar-browser-wasm/actions  
   运行 `gh-pages` workflow

## 🧪 测试

### 单元测试

位置：`__tests__/`  
运行：`pnpm test:unit`

### Web 测试

位置：`__webtests__/`  
运行：`pnpm test:web`

### E2E 测试

位置：`__e2etests__/`  
运行：`pnpm test:e2e`

配置：`playwright.config.ts`

**浏览器**：

- Chromium（默认）
- Firefox（本地开发）
- WebKit（本地开发）

**CI 环境**：仅运行 Chromium 测试以节省时间

## 🚀 部署

### GitHub Pages 自动部署

1. 推送代码到 `alpha` 或 `main` 分支
2. 手动触发 GitHub Actions workflow `gh-pages`
3. 等待构建完成
4. 访问：
   - Vite Demo: https://davidkk.github.io/unrar-browser-wasm/vite-demo/
   - Next.js Demo: https://davidkk.github.io/unrar-browser-wasm/nextjs-demo/
   - E2E Demo: https://davidkk.github.io/unrar-browser-wasm/e2e-demo/

### 本地预览 GitHub Pages

```bash
# 构建 GitHub Pages 内容
pnpm ci:pages

# 使用任意 HTTP 服务器预览
cd gh-pages
python -m http.server 8000
# 或
npx serve
```

然后访问：

- http://localhost:8000/vite-demo/
- http://localhost:8000/nextjs-demo/
- http://localhost:8000/e2e-demo/

## ⚠️ 常见问题

### Q: 为什么 `pnpm dev` 后看不到 WASM 文件变化？

A: 确保先运行 `pnpm build` 重新构建 WASM 核心库，然后 `predev` 钩子会自动复制最新文件。或者手动运行：

```bash
pnpm build
pnpm prepare:vite-demo
```

### Q: E2E 测试失败？

A: 确保：

1. WASM 文件已构建：`pnpm build`
2. E2E Demo 有最新的 WASM 文件：`pnpm prepare:e2e`
3. 开发服务器端口（3000）未被占用

### Q: GitHub Pages 上没有 WASM 文件？

A: 确保：

1. 本地构建成功：`pnpm ci:pages`
2. `gh-pages/` 目录中有 WASM 文件
3. 重新触发 GitHub Actions workflow

### Q: 提交代码前应该做什么？

A: **务必运行**：

```bash
pnpm ok
```

这会执行代码检查、构建和测试，确保代码质量。

## 📝 开发规范

### 代码提交规范

使用 Conventional Commits 规范：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 重构
- `test:` - 测试相关
- `chore:` - 构建/工具相关

**推荐使用**：

```bash
pnpm commit
```

这会启动交互式提交工具，自动生成符合规范的提交信息。

### 分支管理

- `main` - 主分支，稳定版本
- `alpha` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`pnpm commit`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 提交 Pull Request

**提交前务必运行**：

```bash
pnpm ok
```

---

**Happy Coding! 🎉**
