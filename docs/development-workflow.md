# 🔄 开发工作流

## 日常开发

### 修改核心库代码

```bash
# 1. 修改 packages/unrar-wasm/src/
# 2. 重新构建
pnpm build

# 3. 测试
pnpm dev  # 或 pnpm dev:e2e, pnpm dev:nextjs
```

### 修改演示项目代码

```bash
# 直接启动开发服务器（无需重新构建 WASM）
pnpm dev           # Vite Demo
pnpm dev:e2e       # E2E Demo
pnpm dev:nextjs    # Next.js Demo
```

### 提交前检查（必须！）

```bash
pnpm ok

# 如果通过
git add .
pnpm commit  # 或 git commit
```

## 添加新功能

1. 编写代码
2. 编写测试
3. 本地测试：`pnpm test:unit`, `pnpm test:e2e`
4. 代码检查：`pnpm lint`, `pnpm format`
5. 提交前检查：`pnpm ok`
6. 提交代码：`pnpm commit`

## 发布流程

1. 确保测试通过：`pnpm ok`
2. 构建所有项目：`pnpm build`
3. 准备部署：`pnpm ci:pages`
4. 手动触发 GitHub Actions `gh-pages` workflow

## 快速技巧

### 只构建 WASM（不分发）

```bash
pnpm build:wasm
```

### 手动复制 WASM 到 demo

```bash
pnpm prepare:vite-demo    # 单个
pnpm prepare:all          # 所有
```
