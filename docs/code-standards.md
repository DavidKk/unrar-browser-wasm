# 📝 代码规范

## ESLint 规则

### `no-console` 规则

**规则**：`'no-console': 'warn'` - 使用 console 会触发警告

**处理原则**：

1. 不需要的 console → **直接删除**
2. 需要的 console → **添加注释**

```typescript
// eslint-disable-next-line no-console
console.log('必要的日志')
```

**允许使用的场景**：

- 测试文件 (`__tests__/`, `__e2etests__/`, `__webtests__/`)
- CLI 工具 (`packages/node-demo/`)
- 工具脚本 (`scripts/`)
- E2E Demo (`packages/e2e-demo/`)

## 提交规范

使用 Conventional Commits：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式
- `refactor:` - 重构
- `test:` - 测试相关
- `chore:` - 构建/工具

**推荐使用**：

```bash
pnpm commit  # 交互式提交工具
```

## 分支管理

- `main` - 主分支
- `alpha` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## 贡献流程

1. Fork 项目
2. 创建功能分支
3. 提交更改（`pnpm commit`）
4. 推送分支
5. 提交 Pull Request

**提交前务必运行**：`pnpm ok`
