## 1. 官方 shadcn 页面壳

- [x] 1.1 记录当前 acceptance-ui 单文件构建体积，并用 shadcn 4.18 的 `sidebar --dry-run/--diff` 核对所有待新增和待覆盖文件
- [x] 1.2 以官方 Base Sidebar 为基线合并 `SidebarProvider`、`SidebarTrigger`、`SidebarInset`、offcanvas 和移动端 Sheet，新增必需的 `use-mobile`、Tooltip、Skeleton 文件，同时保留现有 Button、Input、Separator、Sheet 改动
- [x] 1.3 从 SidebarProvider 移除 Cookie 持久化和 Cmd/Ctrl+B 全局快捷键，限制页面只使用 offcanvas 展开/收起模式
- [x] 1.4 将案例导航接入 `SidebarMenuButton isActive` 与 `aria-current`，移除导航缩略图并用图标加文字表达通过、受阻和待修改
- [x] 1.5 用 `SidebarProvider + CaseSidebar + SidebarInset` 重组 ReviewApp 页面壳，删除原有 `sidebarOpen`、自定义 Menu 按钮和重复的移动端案例 Sheet

## 2. 响应式审查工作区

- [x] 2.1 增加 1280px 媒体查询状态，在宽屏渲染内联检查器、低于 1280px 渲染按需打开的检查器 Sheet
- [x] 2.2 把人工意见草稿提升到响应式容器之外，并按轮次与 case id 关联，保证跨 1280px 调整视口时文字和附件不丢失
- [x] 2.3 实现 Sidebar、检查器 Sheet、修改清单 Sheet 的互斥打开规则，并保证从修改清单跳转后定位到正确案例
- [x] 2.4 重做 AcceptanceHeader，只展示验收目标、轮次、整单状态、案例总数和待修改数量，不新增逐项已查看或已验收进度
- [x] 2.5 实现宽屏 `证据区 + 21rem 当前项检查器` 布局以及中窄屏单一证据主视图，消除额外页面级滚动和横向溢出

## 3. 证据画布与全屏预览

- [x] 3.1 把 EvidenceViewer 重构为占据主要可用空间的 EvidenceStage，加入深色中性画布、完整图片显示、图片位置和同步缩略图
- [x] 3.2 保留无截图 Empty，并确保无图案例不渲染空白证据画布或可用的图片预览触发器
- [x] 3.3 智能合并 shadcn 4.18 Dialog 上游差异，保留现有项目定制且不覆盖 Button
- [x] 3.4 使用 `DialogTrigger + DialogContent + ScrollArea` 实现全视口预览，让主画布与 Dialog 共享当前图片索引并支持在 Dialog 内切换缩略图
- [x] 3.5 验证长图纵向滚动、Escape 关闭、关闭后焦点恢复，并确认页面不存在缩放、旋转、拖拽、下载或尺寸工具栏

## 4. 当前项检查器与决定操作

- [x] 4.1 将案例标题、模型结论、AI observation、人工意见和跨轮历史组合为 ReviewInspector，删除 `CASE` 和章节编号式呈现
- [x] 4.2 保持 HistoryDisclosure 默认折叠，并继续只按稳定 case id 展示对应轮次的 AI 结果、人工意见和附件
- [x] 4.3 在可写状态组合 Field、Tabs、Textarea 和附图操作；在离线、历史轮次或终态下改为简洁只读结果，不渲染禁用表单
- [x] 4.4 保持 ChangesSheet 为整单修改清单的唯一集中视图，回归跳转、撤回、接受交付和让 AI 修改的既有互斥规则

## 5. 视觉与可访问性

- [x] 5.1 在 `index.css` 中补充 Sidebar 尺寸和证据画布语义 token，保持 neutral 浅色界面、系统中文字体与清晰分隔层级
- [x] 5.2 统一 Button、Sheet、Dialog、Collapsible 和缩略图的可见焦点、可访问名称、选中/展开状态，确保状态不只通过颜色表达
- [x] 5.3 把非必要动效限制为短时颜色、边框或透明度变化，并支持 `prefers-reduced-motion`
- [x] 5.4 检查 Sidebar、证据区、检查器和 Dialog 的滚动责任，确保粘性操作区不遮挡输入、错误信息或键盘焦点

## 6. 自动化与浏览器验收

- [x] 6.1 扩充 acceptance-ui 测试，覆盖写入边界、稳定 case id、无逐项进度推导、图片索引重置和响应式容器选择的纯逻辑
- [x] 6.2 运行 acceptance-ui 的 lint、typecheck、test、build，并比较重构前后的单文件构建体积
- [x] 6.3 运行 `pnpm generate` 更新 `packages/config/src/generated/acceptance-page.ts`，禁止手工编辑生成文件
- [x] 6.4 运行 acceptance 相关 core 测试和 `git diff --check`，确认数据灌入、决定写入与 CLI 构建未被 UI 重构破坏
- [x] 6.5 在 1440px、1024px、768px、375px 浏览器视口验证 Sidebar、检查器断点、多个 Sheet 互斥、证据主画布和无横向溢出
- [x] 6.6 用多图和长图案例验证 Dialog 内切换、滚动、Escape、焦点恢复，并验证 `file://`、历史轮次、accepted、rejected 状态均不出现写入控件
