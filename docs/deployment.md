# 🚀 部署

## GitHub Pages 自动部署

1. 推送代码到 `alpha` 或 `main` 分支
2. 手动触发 GitHub Actions workflow `gh-pages`
3. 等待构建完成
4. 访问：
   - Vite Demo: https://davidkk.github.io/unrar-browser-wasm/vite-demo/
   - Next.js Demo: https://davidkk.github.io/unrar-browser-wasm/nextjs-demo/
   - E2E Demo: https://davidkk.github.io/unrar-browser-wasm/e2e-demo/

## 本地预览 GitHub Pages

```bash
# 构建
pnpm ci:pages

# 预览
cd gh-pages
python -m http.server 8000
# 或
npx serve
```

访问：

- http://localhost:8000/vite-demo/
- http://localhost:8000/nextjs-demo/
- http://localhost:8000/e2e-demo/
