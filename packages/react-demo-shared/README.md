# @unrar-browser/react-demo-shared

共享的 React 组件和工具函数，用于 `vite-demo` 和 `nextjs-demo`。

**注意**：此包以 **源码形式** 直接被 demo 项目使用，不进行编译构建。各 demo 项目的构建工具（Vite / Next.js）会直接处理这些 TypeScript 源文件。

## 包含内容

### 组件

- `Header` - 页头组件
- `Footer` - 页脚组件
- `LoadingProgress` - 加载进度条
- `StatusBanner` - 状态横幅
- `UploadCard` - 文件上传卡片
- `ResultsSection` - 结果展示区域

### Hooks

- `useUnrarModule` - UnRAR 模块加载 Hook
- `useUnrarExtractor` - RAR 文件提取 Hook

### 工具函数

- `formatFileSize` - 格式化文件大小

### 类型

- `StatusType` - 状态类型
- `UnrarModule` - UnRAR 模块接口
- `ExtractedFile` - 提取的文件信息

## 使用

```tsx
import { Header, Footer, useUnrarModule, useUnrarExtractor } from '@unrar-browser/react-demo-shared'

// Vite Demo
const { module, loading, progress } = useUnrarModule({
  basePath: import.meta.env.BASE_URL,
})

// Next.js Demo
const { module, loading, progress } = useUnrarModule({
  autoDetectSubPath: '/nextjs-demo',
})
```

## 私有包

此包为私有包（`"private": true`），仅供项目内部的两个 demo 使用。
