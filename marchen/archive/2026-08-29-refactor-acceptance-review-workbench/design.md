## 背景

验收页由 `packages/acceptance-ui` 中的 Vite + React + shadcn/Base UI 应用构建为单文件 HTML，再由 config generate 烘焙进 CLI 模版。运行时页面只读取灌入的 requirement、decision 和 rounds；本机服务在线时才通过 `/decision` 读写人工决定。这个构建与数据边界不能因为视觉重构而改变。

当前 `ReviewApp` 自己管理桌面 Sidebar、移动端 Sidebar Sheet、案例切换、证据预览、检查说明、历史记录和意见编辑。正文采用纵向记录流，截图、AI 说明、历史和表单依次堆叠。已有 `sidebar.tsx` 是约百行的项目内简化封装；shadcn 4.18 的官方 Base Sidebar 则提供 Provider、Trigger、Inset、offcanvas 和移动端 Sheet，但直接执行 add 会覆盖 Button、Input、Separator、Sheet 和 Sidebar 等本地文件。

本次设计仅改变验收页呈现与前端状态组织。`AcceptanceManager`、生成数据、HTTP 针孔、决定写入规则和归档结构继续作为稳定边界。

## 目标与非目标

**目标：**

- 宽屏首屏同时提供案例导航、主要截图证据和当前项判断信息。
- 低于 1280px 时优先保障证据宽度，把当前项检查器收进 Sheet。
- 使用官方 shadcn 组件组合统一 Sidebar、图片预览、Sheet、表单、确认和折叠行为。
- 保留当前多轮历史、人工附图、离线只读和整单签核语义。
- 让状态、焦点和响应式转换可测试，不以颜色或隐含访问记录表达事实。

**非目标：**

- 不新增逐项 reviewed / accepted 字段，也不阻止用户在未逐项打开的情况下整单接受。
- 不修改 `decision.json`、`result.json`、POST payload 或 acceptance CLI。
- 不实现图片缩放、旋转、拖拽、下载或视频预览。
- 不引入第三方 lightbox、图片查看器、状态管理库、动画库或在线字体。
- 不把修改清单做成常驻右栏，不增加第二套人工意见来源。
- 不在本变更中归档或合并其他进行中的 Marchen 变更。

## 决策

### 1. 页面壳使用官方 SidebarProvider 组合

页面根布局调整为：

```text
SidebarProvider
├── CaseSidebar (Sidebar, collapsible=offcanvas)
└── SidebarInset
    ├── AcceptanceHeader (SidebarTrigger + 轮次 + 整单操作)
    └── ReviewWorkspace
        ├── EvidenceStage
        └── ReviewInspector / InspectorSheet
```

`SidebarProvider` 负责展开状态和移动端 Sheet，`SidebarTrigger` 取代 AppHeader 中的自定义 Menu 按钮，`SidebarInset` 负责释放/占用主内容宽度。Sidebar 默认展开，桌面只支持完全 offcanvas，不提供 icon 折叠，因为验收项无法仅靠图标辨认。

官方实现作为基线但不原样覆盖：先用 `pnpm dlx shadcn@4.18.0 add sidebar --dry-run` 和逐文件 `--diff` 获取差异，再合并 `sidebar.tsx` 及必需的 `use-mobile.ts`、`tooltip.tsx`、`skeleton.tsx`。保留现有 Button、Input、Separator、Sheet 的项目改动与中文文案。

官方 Provider 中的 Cookie 持久化与 Cmd/Ctrl+B 全局快捷键移除。验收页是可离线冻结的单页，Sidebar 开关不属于需要持久化的业务状态；全局快捷键也会给用户带来未声明的行为。移动端断点沿用官方 Sidebar 的断点，当前项检查器另以 1280px 为独立断点。

### 2. 工作区在 1280px 处分流

`SidebarInset` 内部保持固定顶栏和 `min-h-0` 工作区：

```text
>= 1280px: Sidebar | EvidenceStage | 21rem ReviewInspector
<  1280px: Sidebar/Sheet | EvidenceStage | InspectorSheet
```

宽屏下主内容使用 `minmax(0, 1fr) 21rem`，证据区获得剩余宽度，检查器拥有独立 ScrollArea。低于 1280px 时不渲染常驻检查器，通过顶栏“检查与意见”按钮打开右侧 Sheet。更窄视口下案例导航由官方 Sidebar 自动变为左侧 Sheet。

为避免同一表单同时存在于内联检查器和 Sheet 中，使用 `matchMedia('(min-width: 1280px)')` 决定只渲染其中一个容器。意见草稿状态提升到容器切换之外，并按当前轮次和 case id 建立 key，使调整窗口宽度时不会丢失尚未提交的文字与附件。

Sidebar、检查器 Sheet 和修改清单 Sheet 不允许叠开。打开一个覆盖层时先关闭其它覆盖层；从修改清单跳转案例后先更新当前案例，再关闭清单并在需要时打开检查器。

### 3. ReviewApp 只保留领域状态，展示拆成清晰组件

`ReviewApp` 继续拥有 embedded payload、live、decision、roundPosition、caseIndex、busy 和服务错误。展示拆为：

```text
AcceptanceHeader
CaseSidebar
EvidenceStage
ReviewInspector
├── AiObservation
├── OpinionComposer
└── HistoryDisclosure
ChangesSheet
DecisionConfirmation
```

拆分只服务于职责和测试，不创建新的 workspace 包或运行时依赖。`CaseSidebar` 使用 `SidebarMenuButton isActive` 并保留 `aria-current="page"`。模型状态和人工待修改状态用图标/文字表达；小缩略图从导航中移除，图片只在 EvidenceStage 中出现。

页面不维护 visited 集合，也不从 `caseIndex` 切换推导已查看比例。顶部只能展示数据中已有的轮次、整单状态、案例总数和待修改数量。

### 4. 证据区采用主画布加缩略图

EvidenceStage 占满可用高度，结构为标题/位置、深色中性画布和缩略图带。主图使用 `object-contain`，不裁切；深色画布通过新的语义 token 表达，不把全页改成暗色。无图时复用 shadcn Empty，不能显示空画布。

多图只共享一个 `activeImageIndex`。切换案例或轮次时重置到第一张；主画布与全屏预览复用同一索引，因此用户从主画布打开 Dialog 后继续看到同一张图。

### 5. 全屏预览使用 shadcn Dialog 组合

主图使用 `DialogTrigger` 作为语义按钮，避免单独维护 fullscreen boolean。DialogContent 覆盖为全视口、无圆角布局，内部使用 ScrollArea 承载按可用宽度展示的图片；长图纵向滚动。DialogHeader 保留视觉隐藏的 DialogTitle，默认关闭按钮继续使用 shadcn Button。

缩略图带在 Dialog 内继续显示，并与主画布共享 `activeImageIndex`。预览不提供 fit/original、缩放比例、旋转、拖拽或下载。Base UI Dialog 负责焦点圈定、Escape 关闭和关闭后的焦点恢复。

当前 `dialog.tsx` 与 shadcn 4.18 官方 Base 版本基本一致，只智能合并已确认的上游差异（包括标题字体类名），不通过 add 命令覆盖 Button。

### 6. 当前项检查器与修改清单严格分工

ReviewInspector 只包含当前案例：标题、模型结论、AI observation、当前人工意见和该 case id 的跨轮记录。删除 `CASE 01 / 03` 与章节编号，通过 h1/h2/h3、间距和 Separator 建立层级。历史记录继续使用 Collapsible 且默认折叠。

ChangesSheet 仍是整单待修改项集合的唯一集中视图，继续承载跳转、撤回和“让 AI 修改”。Header 在 items 为空时显示“接受交付”，非空时显示“修改清单 N”；二者仍按既有规则互斥。

只读模式不渲染可交互表单的禁用外观，而改为简短显示当前决定或只读原因。在线、pending、最新轮次时才渲染 FieldGroup、Field、Tabs、Textarea 和附图操作。

### 7. 样式继续使用语义 token 和低动效

保留现有系统中文字体和 neutral 主题。新增证据画布语义 token，Sidebar、背景、检查器和分隔线继续使用现有 shadcn token。待修改状态可以使用警示色，但同时必须有图标和文字。

交互只使用颜色、边框或透明度的短过渡，不移动周边布局；`prefers-reduced-motion` 下取消非必要过渡。页面不增加渐变、Google Fonts、卡片墙或通用入场动画。

### 8. 生成链与验证保持原有边界

实现完成后先运行 acceptance-ui 的 lint、typecheck、test 和 build，再运行 `pnpm generate` 更新 `packages/config/src/generated/acceptance-page.ts`。生成文件只通过 generate 更新，不手工编辑。

浏览器验收至少覆盖 1440px、1024px、768px 和 375px；验证 Sidebar 展开/收起、检查器断点、多个 Sheet 不叠开、主图与 Dialog 多图同步、长图滚动、焦点恢复、离线只读和终态隐藏写入控件。

## 风险与权衡

- **官方 Sidebar 体积较大。** 它比当前简化封装增加 Provider、移动端判断、Tooltip 和 Skeleton。代价是单文件模版增大，但换来统一状态、移动端覆盖层和可维护的官方组合；构建后需要记录产物体积变化，避免异常膨胀。
- **不能直接运行覆盖式 add。** shadcn dry-run 会覆盖多个已有组件，其中 Sheet 有本地尺寸、动画和中文可访问文案。实现必须逐文件 diff 合并，否则可能回退现有交互。
- **响应式容器切换可能丢草稿。** 内联检查器与 Sheet 不能同时渲染同一表单；通过提升草稿状态规避断点切换丢失，测试需覆盖带文字和附件时改变视口。
- **多个滚动区可能造成使用混乱。** Sidebar、证据、检查器和 Dialog 各有滚动责任。每个区域只在内容溢出时滚动，主页面本身不形成第五层滚动，并用浏览器验证滚轮与键盘焦点。
- **多个 Sheet 可能叠层。** Sidebar、检查器和修改清单共享覆盖层语义，需要显式互斥状态与回归测试。
- **全宽图片不等于像素级缩放。** 本变更优先提供全视口宽度和长图滚动，不解决局部像素检查；如以后需要缩放/拖拽，应作为独立能力设计，不能重新塞回尺寸工具栏。
- **没有逐项人工完成度。** 用户仍可未逐项打开就接受整单，这是现有数据协议的明确结果。本变更不以临时 visited 状态制造虚假的审查保障。
- **既有 lite 变更仍处于 open。** `simplify-acceptance-navigation` 已完成但尚未归档；本变更实现前应明确基线并避免把两者的 artifact 或验收轮次混用。
