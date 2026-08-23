# @marchen/acceptance-ui

## 包职责

验收页的 React 源码。用 Vite + shadcn 开发交互，构建成单文件 `dist/index.html`，供 `@marchen/config` 灌进变更目录。运行时不被 CLI 直接 import。

## 依赖关系

```
@marchen/acceptance-ui   # 无 workspace 依赖
        ↓（构建产物 dist/index.html，由 config generate 烘焙）
@marchen/config
        ↑
@marchen/core
```

禁止 `@marchen/config` / `core` / CLI 把 React 当运行时依赖。

## 开发命令

```bash
pnpm --filter @marchen/acceptance-ui dev        # Vite 热更新
pnpm --filter @marchen/acceptance-ui build      # 单文件 dist/index.html
pnpm --filter @marchen/acceptance-ui typecheck
pnpm --filter @marchen/acceptance-ui lint
```

## 源码结构

```
src/
├── main.tsx
├── app.tsx
├── index.css
├── lib/utils.ts
├── components/ui/     # shadcn 组件
├── features/          # lightbox 审查与待修改
└── hooks/
```

## 注意事项

- `base: './'` + `vite-plugin-singlefile`，保证 `file://` 能双击打开
- Vite 侧 import 用 `.tsx`，不要套 NodeNext 的 `.js`
- 不要在此包写 Node.js `fs`；不要把业务签核逻辑从 core 搬进来
