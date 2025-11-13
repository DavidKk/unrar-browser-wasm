# 故障排除指南

## 常见问题

### 1. Module not found: Can't resolve 'module'

**错误信息**：

```
Module not found: Can't resolve 'module'
Import trace for requested module:
./src/hooks/useUnrarModule.ts
```

**原因**：
Next.js 的 webpack 在客户端打包时尝试解析 Node.js 核心模块（如 `module`、`fs`、`path`），但这些模块在浏览器环境中不存在。

**解决方案**：
在 `next.config.ts` 中添加 webpack fallback 配置：

```typescript
webpack: (config, { isServer }) => {
  // 在客户端构建时，排除 Node.js 核心模块
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      module: false,
    }
  }
  return config
}
```

### 2. WASM 文件加载失败

**错误信息**：

```
Failed to load unrar.js
```

**原因**：

- `public` 目录中缺少 WASM 文件
- 文件路径不正确
- 服务器未正确配置 WASM MIME 类型

**解决方案**：

1. 确保 WASM 文件存在：

```bash
ls -la packages/nextjs-demo/public/
# 应该看到 unrar.js 和 unrar.wasm
```

2. 如果文件不存在，从核心包复制：

```bash
cp packages/unrar-wasm/build/unrar.js packages/nextjs-demo/public/
cp packages/unrar-wasm/build/unrar.wasm packages/nextjs-demo/public/
```

3. 重启开发服务器：

```bash
pnpm dev:nextjs
```

### 3. 开发时热重载问题

**现象**：
修改代码后，WASM 模块没有重新加载。

**解决方案**：
WASM 模块是全局单例，修改相关代码后需要手动刷新页面：

- 按 `Cmd+R` (macOS) 或 `Ctrl+R` (Windows/Linux)
- 或在浏览器中点击刷新按钮

### 4. TypeError: Cannot read property 'Archive' of undefined

**原因**：
WASM 模块尚未加载完成就尝试使用。

**解决方案**：
确保在使用 UnRAR 功能前检查模块是否已加载：

```typescript
if (!unrarModule) {
  return // 或显示加载中状态
}
```

`useUnrarModule` hook 已经处理了这个问题，确保在使用前检查 `module` 不为 `null`。

### 5. 服务器端渲染错误

**错误信息**：

```
window is not defined
document is not defined
```

**原因**：
在服务器端渲染时访问了浏览器专有的 API。

**解决方案**：

1. 确保所有使用浏览器 API 的组件都标记为客户端组件：

```typescript
'use client'
```

2. 在 hooks 中添加浏览器环境检查：

```typescript
useEffect(() => {
  if (typeof window === 'undefined') {
    return
  }
  // 浏览器专有代码
}, [])
```

### 6. 构建失败

**问题**：
运行 `pnpm build:nextjs` 时失败。

**解决方案**：

1. 清理缓存：

```bash
cd packages/nextjs-demo
rm -rf .next node_modules
```

2. 重新安装依赖：

```bash
cd ../..
pnpm install
```

3. 确保核心包已构建：

```bash
pnpm build
```

4. 重新构建 Next.js 应用：

```bash
pnpm build:nextjs
```

### 7. 生产环境静态导出问题

**问题**：
使用 `output: 'export'` 后某些功能不工作。

**注意事项**：
静态导出模式有一些限制：

- 不支持服务器端运行时功能
- 不支持图片优化（需要使用 `next/legacy/image` 或外部服务）
- 不支持国际化路由
- 不支持 API 路由

对于本项目，所有处理都在客户端完成，所以这些限制不影响功能。

## 调试技巧

### 启用详细日志

在浏览器控制台中查看详细的加载日志：

```typescript
// 在 useUnrarModule.ts 中添加
console.log('[UnRAR] Loading module...')
console.log('[UnRAR] Base path:', basePath)
console.log('[UnRAR] Module loaded:', loadedModule)
```

### 检查 WASM 文件

在浏览器中直接访问 WASM 文件：

- 开发环境：`http://localhost:3000/unrar.js`
- 生产环境：`https://your-domain.com/unrar.js`

如果返回 404，说明文件路径配置有问题。

### 网络面板

打开浏览器开发者工具的"网络"标签，筛选 `.wasm` 文件：

- 检查 HTTP 状态码（应该是 200）
- 检查 Content-Type（应该是 `application/wasm`）
- 检查文件大小（unrar.wasm 约 640KB）

## 获取帮助

如果以上解决方案都无法解决问题：

1. 查看 [Next.js 文档](https://nextjs.org/docs)
2. 查看 [WebAssembly 文档](https://webassembly.org/)
3. 提交 GitHub Issue，包含：
   - 错误信息完整堆栈
   - 操作系统和浏览器版本
   - Node.js 和 pnpm 版本
   - 重现步骤
