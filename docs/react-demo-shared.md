# React Demo 共享模块说明

## 概述

`@unrar-browser/react-demo-shared` 是一个私有包，用于承载 `vite-demo` 和 `nextjs-demo` 的公共代码，减少重复，提高可维护性。

**特点**：此包以 **源码形式** 直接被使用，不进行编译构建。各 demo 项目通过 Vite 或 Next.js 直接处理 TypeScript 源文件，确保：

- ✅ Tailwind CSS 样式正常工作
- ✅ 类型检查实时生效
- ✅ 热重载快速响应

## 包含内容

### 组件（6个）

- **Header** - 页头组件
- **Footer** - 页脚组件
- **LoadingProgress** - 加载进度条
- **StatusBanner** - 状态横幅
- **UploadCard** - 文件上传卡片
- **ResultsSection** - 结果展示区域

### Hooks（2个）

- **useUnrarModule** - UnRAR WASM 模块加载 Hook
- **useUnrarExtractor** - RAR 文件提取 Hook

### 工具函数

- **formatFileSize** - 格式化文件大小显示

### 类型定义

- **StatusType** - 状态类型（`'info' | 'success' | 'error'`）
- **UnrarModule** - UnRAR 模块接口
- **ExtractedFile** - 提取的文件信息接口

## 使用方式

### Vite Demo

```tsx
import {
  Header,
  Footer,
  useUnrarModule,
  useUnrarExtractor,
  // ... 其他导入
} from '@unrar-browser/react-demo-shared'

function App() {
  // 使用 basePath 选项
  const { module, loading, progress, error } = useUnrarModule({
    basePath: import.meta.env.BASE_URL
  })

  const { extractedFiles, extract, ... } = useUnrarExtractor(module)

  // ...
}
```

### Next.js Demo

```tsx
'use client'

import {
  Header,
  Footer,
  useUnrarModule,
  useUnrarExtractor,
  // ... 其他导入
} from '@unrar-browser/react-demo-shared'

export default function Home() {
  // 使用 autoDetectSubPath 选项自动检测子路径
  const { module, loading, progress, error } = useUnrarModule({
    autoDetectSubPath: '/nextjs-demo'
  })

  const { extractedFiles, extract, ... } = useUnrarExtractor(module)

  // ...
}
```

## useUnrarModule 选项

### `basePath?: string`

用于 Vite 项目，直接指定 base URL：

```tsx
useUnrarModule({
  basePath: import.meta.env.BASE_URL || '/',
})
```

### `autoDetectSubPath?: string`

用于 Next.js 项目，自动检测路径中的子目录：

```tsx
useUnrarModule({
  autoDetectSubPath: '/nextjs-demo',
})
```

当页面路径为 `/abc/nextjs-demo/xxx` 时，会自动提取 `/abc/nextjs-demo/` 作为 basePath。

## 项目结构

```
packages/react-demo-shared/
├── src/
│   ├── components/      # 6 个公共组件
│   ├── hooks/           # 2 个公共 Hooks
│   ├── utils/           # 工具函数
│   ├── types.ts         # 类型定义
│   └── index.ts         # 导出入口
├── package.json         # private: true
├── tsconfig.json
└── README.md
```

## Tailwind CSS 配置

为了确保共享包中的 Tailwind 样式生效，需要在各 demo 的 `tailwind.config` 中添加共享包路径：

### Vite Demo

```js
// packages/vite-demo/tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../react-demo-shared/src/**/*.{js,ts,jsx,tsx}', // 扫描共享包
  ],
  // ...
}
```

### Next.js Demo

```ts
// packages/nextjs-demo/tailwind.config.ts
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../react-demo-shared/src/**/*.{js,ts,jsx,tsx}', // 扫描共享包
  ],
  // ...
}
```

## 优势

1. **减少重复代码** - 6 个组件、2 个 Hooks、1 个工具函数不再重复
2. **统一维护** - 公共代码只需在一处修改
3. **类型安全** - 统一的类型定义
4. **适配两种框架** - 同时支持 Vite 和 Next.js
5. **无需构建** - 源码直接使用，Tailwind 样式正常工作

## 更新记录

- 创建共享包，包含所有公共代码
- 更新 `vite-demo` 和 `nextjs-demo` 使用共享包
- 删除两个 demo 中的重复文件
- 更新项目文档和结构说明
