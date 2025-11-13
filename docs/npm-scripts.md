# 📜 NPM 脚本命令说明

## 🔥 常用命令

### `pnpm ok` ⭐

**提交代码前的快速检查**

执行：代码格式检查 + 构建 + E2E 测试

```bash
pnpm ok
```

### 开发服务器

```bash
pnpm dev           # Vite Demo (http://localhost:3000)
pnpm dev:e2e       # E2E Test Demo (http://localhost:3000)
pnpm dev:nextjs    # Next.js Demo (http://localhost:3000)
pnpm dev:node      # Node.js Demo（观察模式）
```

### Node.js Demo

```bash
pnpm node-demo path/to/file.rar ./output [password]
```

## 🏗️ 构建命令

### `pnpm build` ⭐

构建 WASM 核心库 + 自动分发到所有 demo

```bash
pnpm build
```

### `pnpm build:wasm`

仅构建 WASM 核心库（不分发到 demo）

```bash
pnpm build:wasm
```

## 📦 准备命令

复制 WASM 文件到各 demo 的 `public/` 目录

```bash
pnpm prepare:all           # 所有 demo
pnpm prepare:e2e           # E2E demo
pnpm prepare:vite-demo     # Vite demo
pnpm prepare:nextjs-demo   # Next.js demo
```

> **注意**：`pnpm build` 会自动调用 `prepare:all`

## 🧪 测试命令

```bash
pnpm test          # 运行所有测试
pnpm test:unit     # 单元测试（Jest）
pnpm test:web      # Web 测试（JSDOM）
pnpm test:e2e      # E2E 测试（Playwright）
```

## 🎨 代码质量

```bash
pnpm lint          # ESLint 检查并修复
pnpm format        # Prettier 格式化
```

## 🌐 CI/部署命令

```bash
pnpm ci:pages      # 构建 GitHub Pages 内容
pnpm ci:coverage   # CI 测试覆盖率
pnpm ci:build      # CI 构建
pnpm ci            # 完整 CI 检查
```

## 🔧 其他

```bash
pnpm commit        # 交互式提交（Commitizen）
```
