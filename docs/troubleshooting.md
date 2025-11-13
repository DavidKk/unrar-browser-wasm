# ⚠️ 常见问题

## Q: 为什么 `pnpm dev` 后看不到 WASM 文件变化？

确保先运行 `pnpm build` 重新构建 WASM，`predev` 钩子会自动复制最新文件。

或手动运行：

```bash
pnpm build
pnpm prepare:vite-demo
```

## Q: E2E 测试失败？

确保：

1. WASM 文件已构建：`pnpm build`
2. E2E Demo 有最新的 WASM 文件：`pnpm prepare:e2e`
3. 端口 3000 未被占用

## Q: GitHub Pages 上没有 WASM 文件？

确保：

1. 本地构建成功：`pnpm ci:pages`
2. `gh-pages/` 目录中有 WASM 文件
3. 重新触发 GitHub Actions workflow

## Q: 提交代码前应该做什么？

**务必运行**：

```bash
pnpm ok
```

这会执行代码检查、构建和测试，确保代码质量。
