## 1. 已落地基线

- [x] 1.1 注册 `marchen acceptance serve|stop|render|status`，支持 `--json`；serve 支持 `--port` `--open`
- [x] 1.2 serve 只绑 `127.0.0.1`，端口 7420–7430，pid、token、复用已有进程；人对着跑默认前台，Ctrl+C 清 pid
- [x] 1.3 删除 review 的 skill/command 模板；`marchen update` 清理各工具目录里由 Marchen 生成的 `review.md`
- [x] 1.4 lite 一道四选题；archive 缺决定或非 accepted 时警告可强行过；lite 直接归档不再问第二次
- [x] 1.5 `packages/acceptance-ui` 已有 Vite + React + shadcn 骨架，并能构建单文件 HTML

## 2. 类型与 decision.json

- [x] 2.1 把 `ACCEPTANCE_DECISION_FILE` 改为 `decision.json`；增加 `decision-assets/` 常量；`AcceptanceDecision.items` 改为待修改项数组（`id` / `comment` / `images`）
- [x] 2.2 core 读写 JSON：`accepted` 拒绝非空 items，`rejected` 拒绝空 items 或空 comment；`pending` 允许边攒待修改
- [x] 2.3 若磁盘上仍是旧 `decision.md`，读取时转成 JSON 形状（status + 空 items 或把评语记成一项），写入只出 json
- [x] 2.4 单测覆盖上述校验、路径常量和旧 md 兼容

## 3. HTTP 与灌页

- [x] 3.1 `POST /decision` 写 `decision.json`；`newImages` 只落到 `decision-assets/`，MIME 限 png/jpeg/webp/gif，单张 ≤ 5MB；落盘 json 不含字节
- [x] 3.2 GET/POST `/decision` 的响应体改为 JSON 文档；无 token 仍 401；夹外路径仍拒写
- [x] 3.3 render 从 `decision.json` 灌 `#acceptance-data`，图用相对路径；烤失败不影响 POST 200
- [x] 3.4 单测：非法 MIME、超限、accepted+items、rejected 空 items、附图相对路径

## 4. 验收页应用

- [x] 4.1 把 `acceptance-ui` 接入 workspace 脚本：build 产出 `dist/index.html`，config generate 缺产物则失败
- [x] 4.2 页面约定：冷铝 lightbox 审查队列，系统中文栈；禁止杏黄/陶土、报纸排版、仪表盘卡片墙（历史实现，由 7.3 重构）
- [x] 4.3 逐项「打回修改」：纯文本 + 插图（可粘贴），提交进待修改；pending 时可撤回；空评语不得提交（历史实现，由 7.5 重构）
- [x] 4.4 待修改为空才显示「接受交付」；非空才显示「让 AI 修改」；没有整单打回；模型 通过/未通过/受阻 不禁用接受
- [x] 4.5 `file://` 或 health 失败时写入控件保持 hidden；accepted/rejected 后隐藏写入；POST 成功不整页刷新
- [x] 4.6 generate 烘焙 `dist/index.html` 为 `ACCEPTANCE_PAGE_TEMPLATE`，替换手写 HTML 模版

## 5. Skill 文案

- [x] 5.1 acceptance skill：轮询 `decision.json`；`rejected` 按 items 的 comment 与附图修改；开新轮前抄 `human-decision.json` 并重置 pending + 空 items；禁止代点；只截图、不装 agent-browser
- [x] 5.2 apply / lite / archive / status 文案从 `decision.md` 改为 `decision.json`；打回改称待修改 / 让 AI 修改
- [x] 5.3 重跑 config generate，确认生成物与上述文案一致

## 6. 收尾

- [x] 6.1 `pnpm check` 通过
- [x] 6.2 手跑：逐项打回（含插图）→ 撤回一项 → 让 AI 修改写 rejected → 新轮 pending 清空 → 待修改为空时接受 → `file://` 无按钮且显示已接受

## 7. 验收页信息架构重构

- [x] 7.1 core render 读取每轮可选的 `human-decision.json` 并写入页面 payload；缺失时兼容为无人工记录
- [x] 7.2 shared / skill 约束同一验收目标跨轮复用 case id；覆盖新增、移除和文案变化的测试
- [x] 7.3 用 shadcn 黑白 token 重构桌面页面：顶栏轮次与状态、左侧案例 Sidebar、单列当前项正文，移除固定右栏和 lightbox 队列
- [x] 7.4 实现证据查看器：多图切换、全屏、适应窗口 / 原始尺寸和无证据空态
- [x] 7.5 实现 Issue 式验收记录：AI 检查、跨轮人工记录、Markdown 编辑 / 安全预览、图片选择 / 粘贴 / 拖入，以及 pending 状态下编辑和撤回
- [x] 7.6 实现按需修改清单 Sheet / Drawer、跳回案例、终态确认，以及窄屏 Sidebar Sheet 和单列布局
- [x] 7.7 补齐页面与 core 测试：历史决定回灌、缺文件兼容、稳定 id 关联、只读旧轮、写入控件门禁和 POST 后无刷新
- [x] 7.8 构建 acceptance-ui 并重跑 config generate；执行相关 lint、类型检查、core 测试和真实浏览器交互验收
