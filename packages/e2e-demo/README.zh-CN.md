# @unrar-browser/e2e-demo

用于 @unrar-browser/core 库的端到端测试演示。此演示被 Playwright 用于自动化测试。

[English](./README.md) | 简体中文

## 开发

```bash
# 安装依赖（在根目录）
pnpm install

# 首先构建 WASM 库
pnpm --filter @unrar-browser/core build

# 启动开发服务器
pnpm --filter @unrar-browser/e2e-demo dev
```

## 功能

- 自动加载和测试 RAR 文件
- 文件解压与内容预览
- 十六进制转储和文本预览
- 错误处理和调试

## 测试

该演示会自动加载 `q.rar` 并显示：

- 带大小的文件列表
- 内容预览（十六进制和文本）
- 空内容或无效内容的警告

