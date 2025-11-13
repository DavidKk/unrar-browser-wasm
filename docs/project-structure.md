# 📁 项目结构

```
unrar-browser-wasm/
├── packages/
│   ├── unrar-wasm/          # 核心 WASM 库
│   │   ├── src/
│   │   ├── build/           # WASM 构建输出
│   │   └── vendor/unrar/    # UnRAR 源代码
│   ├── react-demo-shared/   # React Demo 公共模块（私有）
│   │   ├── src/
│   │   │   ├── components/  # 公共组件
│   │   │   ├── hooks/       # 公共 Hooks
│   │   │   ├── utils/       # 公共工具函数
│   │   │   └── types.ts     # 公共类型定义
│   │   └── package.json
│   ├── vite-demo/           # Vite + React 演示
│   │   ├── public/          # 静态资源（包含 WASM 文件）
│   │   ├── src/
│   │   │   ├── App.tsx      # 主应用
│   │   │   └── main.tsx     # 入口文件
│   │   └── dist/            # 构建输出
│   ├── nextjs-demo/         # Next.js 演示
│   │   ├── public/          # 静态资源（包含 WASM 文件）
│   │   ├── src/
│   │   │   └── app/         # App Router
│   │   └── out/             # 构建输出
│   ├── e2e-demo/            # E2E 测试演示
│   │   ├── public/          # 静态资源（包含 WASM 文件和测试文件）
│   │   └── dist/            # 构建输出
│   └── node-demo/           # Node.js 演示
│       ├── encryption.rar   # 测试文件（带密码）
│       └── noencryption.rar # 测试文件（无密码）
├── __tests__/               # 单元测试
├── __webtests__/            # Web 测试
├── __e2etests__/            # E2E 测试
├── docs/                    # 项目文档
├── gh-pages/                # GitHub Pages 部署目录
└── .github/workflows/       # GitHub Actions 配置
```

## 关键目录说明

### `packages/unrar-wasm/` - 核心 WASM 库

- `src/index.ts` - TypeScript 接口定义
- `src/unrar.cpp` - C++ WASM 绑定
- `build/` - WASM 构建输出 (unrar.js + unrar.wasm)
- `vendor/unrar/` - UnRAR 官方源代码

### `packages/react-demo-shared/` - React Demo 公共模块

私有包，用于承载 `vite-demo` 和 `nextjs-demo` 的公共代码：

- `components/` - 6 个公共组件（Header, Footer, LoadingProgress, StatusBanner, UploadCard, ResultsSection）
- `hooks/` - 2 个公共 Hooks（useUnrarModule, useUnrarExtractor）
- `utils/` - 公共工具函数（formatFileSize）
- `types.ts` - 公共类型定义（StatusType, UnrarModule, ExtractedFile）

**特性**：

- 支持 Vite（通过 `basePath` 选项）
- 支持 Next.js（通过 `autoDetectSubPath` 选项）
- 减少代码重复，提高可维护性

### Demo 项目

每个 demo 的 `public/` 目录都包含从核心库复制的 WASM 文件。

**vite-demo 和 nextjs-demo** 现在只包含：

- 主应用文件（App.tsx / page.tsx）
- 入口文件和配置
- 样式文件

所有公共组件和 hooks 已移至 `react-demo-shared`。

### 测试目录

- `__tests__/` - Node.js 环境单元测试
- `__webtests__/` - 浏览器环境测试（JSDOM）
- `__e2etests__/` - 真实浏览器 E2E 测试
