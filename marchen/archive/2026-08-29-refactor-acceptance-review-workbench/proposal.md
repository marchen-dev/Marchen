## 动机

当前验收页已经支持案例导航、截图证据、跨轮记录和人工签核，但正文仍按“截图 → AI 说明 → 历史 → 人工意见”纵向铺开。用户审查每个案例时需要反复滚动，截图没有成为首屏主角，导航、证据和决策动作的职责也不够集中。现有自定义 Sidebar 还分别维护桌面与移动端状态，和 shadcn 组件体系存在重复实现。

本次变更将验收页重构为面向证据审查的工作台，在不改变验收数据协议和签核规则的前提下，提高截图可读性、当前项判断效率与不同视口下的操作一致性。

## 变更内容

- 将桌面验收页重组为“案例导航、证据画布、当前项检查器”三块工作区：宽屏下检查器常驻，低于 1280px 时收进按需打开的 Sheet。
- 使用官方 shadcn `SidebarProvider`、`Sidebar`、`SidebarTrigger` 和 `SidebarInset` 统一桌面折叠与移动端导航；采用 `offcanvas` 模式，不提供图标折叠栏。
- 让截图证据占据主要可视区域，以深色中性画布承载图片；点击主图通过 shadcn `Dialog` 打开全视口预览。
- 全屏预览支持在同一 Dialog 内切换多张截图并显示缩略图，不增加缩放、旋转、拖拽或尺寸工具栏。
- 将 AI 检查、人工意见和当前案例历史集中到当前项检查器；修改清单仍通过独立 Sheet 按需打开，不在右侧常驻重复展示。
- 删除报告式章节编号与冗余导航提示，保持克制的 shadcn 黑白灰视觉、系统中文字体和低动效反馈。
- 不增加逐项“已查看/已验收”状态，不展示无法由持久化数据证明的进度；整单接受与让 AI 修改继续只由 `decision.json` 的 `status` 和 `items` 决定。
- 保留离线只读页面、本机健康探测、人工附图、跨轮记录和终态隐藏写入控件等既有行为。

## 能力

### 新增能力

无。

### 修改能力

- `acceptance-page`：把验收页从纵向 Issue 记录流调整为响应式证据审查工作台，统一官方 shadcn Sidebar 与 Dialog 组合，并明确不同视口、只读状态和多图预览行为。

## 影响范围

- `packages/acceptance-ui/src/features/review-app.tsx` 的页面布局、案例导航、证据预览、当前项检查器和响应式交互。
- `packages/acceptance-ui/src/components/ui/sidebar.tsx` 及其官方 shadcn 依赖组件；需要以 dry-run/diff 方式合并，不能覆盖现有 Button、Sheet 等本地改动。
- `packages/acceptance-ui/src/components/ui/dialog.tsx` 的官方版本同步与全视口组合方式。
- `packages/acceptance-ui/src/index.css` 的 Sidebar 尺寸、证据画布和响应式语义 token。
- acceptance-ui 测试、构建产物和 `packages/config/src/generated/acceptance-page.ts`。
- 不影响 `AcceptanceManager`、acceptance CLI、HTTP 路由、`decision.json` / `result.json` 结构和变更目录布局。
