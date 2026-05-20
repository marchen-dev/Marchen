## 目的

`marchen-review` skill 在代码级对照之外，提供基于 chrome-devtools MCP 的 UI 行为验证能力，由用户在 review 入口选择启用，sub-agent 以"乐观执行 + 阻塞即停"模式驱动浏览器走完 specs 场景并产出分类报告。

### 需求: review skill SHALL 在主会话用 AskUserQuestion 让用户选择 review 模式

review skill 在选定变更之后、spawn sub-agent 之前，MUST 用 **AskUserQuestion** 让用户三选一：代码 review、UI 验证、两者都做。模式选择 MUST 在主会话完成，sub-agent 不向用户提问。

#### 场景: 用户选择代码 review

- **GIVEN** 用户进入 `marchen-review` skill 并选定一个变更
- **WHEN** AskUserQuestion 弹出模式选项
- **AND** 用户选择"代码 review"
- **THEN** sub-agent SHALL 仅执行代码级对照（git diff vs artifact）
- **AND** 报告 MUST NOT 包含 UI 验证章节

#### 场景: 用户选择 UI 验证

- **GIVEN** 用户进入 review skill 并选定变更
- **WHEN** 用户选择"UI 验证"
- **THEN** sub-agent SHALL 跳过代码对照部分
- **AND** 直接进入 UI 验证流程

#### 场景: 用户选择两者都做

- **GIVEN** 用户进入 review skill 并选定变更
- **WHEN** 用户选择"两者都做"
- **THEN** sub-agent SHALL 先执行代码级对照
- **AND** 再执行 UI 验证
- **AND** 报告 MUST 包含两个独立章节

### 需求: review skill SHALL 嗅探 diff 中的 UI 文件并把结果作为提示附在 AskUserQuestion

review skill 在弹出模式选择之前，MUST 执行 `git diff --name-only HEAD` 并匹配 UI 文件扩展名（.tsx/.ts/.jsx/.js/.vue/.svelte/.astro/.css/.scss/.less/.html）。匹配结果 MUST 作为提示信息附在 AskUserQuestion 的问题描述中，但 MUST NOT 替用户做决定。

#### 场景: diff 命中 UI 文件

- **GIVEN** 当前变更的 `git diff` 包含 `.tsx` 或 `.css` 等 UI 文件
- **WHEN** review skill 弹出模式选择 AskUserQuestion
- **THEN** 问题描述 SHALL 附带提示："检测到 diff 涉及 UI 文件（<文件列表>），建议选择 UI 验证或两者都做"
- **AND** 所有三个模式选项 MUST 仍可选

#### 场景: diff 不包含 UI 文件

- **GIVEN** 当前变更的 `git diff` 不含任何 UI 文件
- **WHEN** review skill 弹出模式选择 AskUserQuestion
- **THEN** 问题描述 MUST NOT 附带 UI 提示
- **AND** 默认选项 SHOULD 为"代码 review"

### 需求: sub-agent SHALL 在 UI 验证开始前检测 chrome-devtools MCP 可用性并按可用性分支

进入 UI 验证流程后，sub-agent MUST 先尝试调用 chrome-devtools MCP 的探测工具（如 `list_pages`）确认 MCP 可用。不可用时 MUST 在报告中标注并跳过本节，MUST NOT 让整个 review 失败。

#### 场景: chrome-devtools MCP 可用

- **GIVEN** 用户已在所用 AI 工具中配置 chrome-devtools MCP
- **WHEN** sub-agent 调用探测工具
- **THEN** 探测 SHALL 成功返回
- **AND** sub-agent SHALL 继续执行后续场景验证流程

#### 场景: chrome-devtools MCP 不可用

- **GIVEN** 用户未配置 chrome-devtools MCP
- **WHEN** sub-agent 调用探测工具
- **THEN** 调用 SHALL 失败或工具不存在
- **AND** 报告 SHALL 包含 "⏭ chrome-devtools MCP 不可用，跳过 UI 验证"
- **AND** 报告 SHALL 附带安装提示（`npx chrome-devtools-mcp@latest`）
- **AND** sub-agent SHALL 完成代码部分（如启用）后正常退出

### 需求: sub-agent SHALL 从 specs 的"场景"块提取待验证场景

sub-agent MUST 优先从变更的 specs 文件中提取 `#### 场景:` 块作为待验证场景列表。若 specs 不存在或不含场景，MAY 退化到从 tasks/proposal 提取与 UI 相关的描述。仍无可提取场景时 MUST 在报告中标注并跳过本节。

#### 场景: specs 中存在场景

- **GIVEN** 变更的 specs 目录下至少有一个 spec.md 包含 `#### 场景:` 块
- **WHEN** sub-agent 提取场景
- **THEN** 每个 `#### 场景:` 块 SHALL 成为一个待验证场景
- **AND** 场景描述 SHALL 用于驱动后续 navigate/click/assert

#### 场景: specs 不存在但 tasks 含 UI 描述

- **GIVEN** 变更未生成 specs 但 tasks.md 含 UI 任务描述
- **WHEN** sub-agent 提取场景
- **THEN** sub-agent MAY 从 tasks 推断验证点
- **AND** 报告 SHALL 标注"基于 tasks 推断，覆盖度可能不完整"

#### 场景: 没有任何可提取场景

- **GIVEN** specs 和 tasks 都不含可识别的 UI 场景
- **WHEN** sub-agent 提取场景
- **THEN** 报告 SHALL 包含 "未找到可验证的 UI 场景"
- **AND** sub-agent SHALL 跳过本节

### 需求: sub-agent SHALL 从项目配置推断 dev server URL，不硬猜端口

sub-agent MUST 从项目配置文件（`package.json` 的 dev/start/serve 脚本、`vite.config.*` / `next.config.*` / `nuxt.config.*` / `vue.config.*` / `svelte.config.*` / `astro.config.*` / `webpack.config.*` / `angular.json` 等框架配置、`.env*` 文件中的 PORT 类变量，必要时 README）推断 dev server 地址，再用 chrome-devtools MCP 导航并用快照确认页面像被测应用。MUST NOT 按硬编码端口列表盲扫。

#### 场景: 推断成功且 dev server 运行中

- **GIVEN** 项目 `vite.config.ts` 配置 `server.port = 5173` 且 dev server 已启动
- **WHEN** sub-agent 推断 URL
- **THEN** sub-agent SHALL 解析得到 http://localhost:5173
- **AND** 导航后快照 SHALL 确认页面像被测应用
- **AND** sub-agent SHALL 使用该 URL 执行场景

#### 场景: 推断不出 URL

- **GIVEN** 项目没有任何可解析的端口配置（如纯静态文档或 SDK 项目）
- **WHEN** sub-agent 推断 URL
- **THEN** sub-agent MUST NOT 尝试默认端口扫描
- **AND** 所有场景 SHALL 被标记为 ⏭ "URL unknown"
- **AND** 报告 SHALL 说明推断依据（如"未在 package.json scripts 或框架配置中找到端口"）
- **AND** SHALL 提示用户确认地址后重新运行 review

#### 场景: 推断成功但 dev server 未启动

- **GIVEN** 项目 `package.json` scripts.dev 含 `next dev -p 4000` 但 dev server 未启动
- **WHEN** sub-agent 推断到 http://localhost:4000 并尝试导航
- **THEN** 导航 SHALL 失败（连接拒绝）
- **AND** 所有场景 SHALL 被标记为 ⏭ "URL unknown"
- **AND** 报告 SHALL 提示用户启动 dev server 后重新运行 review

### 需求: sub-agent SHALL 以"乐观执行 + 阻塞即停"模式跑场景

sub-agent MUST 逐个场景执行：navigate → 观察页面（snapshot）→ 按场景描述执行交互 → 比对预期。遇到任何阻塞（登录墙、权限不足、缺数据等）时 MUST NOT 尝试绕过或填充猜测数据，MUST 记录阻塞原因并立即跳到下一个场景。

#### 场景: 场景通过

- **GIVEN** 场景描述的预期结果在页面上可被观察到
- **WHEN** sub-agent 完成 navigate 和交互
- **THEN** 报告 SHALL 标记该场景为 ✅
- **AND** sub-agent SHALL 继续下一个场景

#### 场景: 场景因登录墙阻塞

- **GIVEN** 场景目标页面要求认证
- **WHEN** sub-agent navigate 后看到登录界面或 401
- **THEN** sub-agent MUST NOT 尝试登录或填充凭据
- **AND** 报告 SHALL 标记该场景为 ⏭ "需要登录"
- **AND** sub-agent SHALL 继续下一个场景

#### 场景: 场景失败（真实问题）

- **GIVEN** sub-agent 完成场景交互
- **WHEN** 页面状态与场景描述的预期不符
- **THEN** 报告 SHALL 标记该场景为 ❌
- **AND** 报告 SHALL 附具体证据（console error 摘要、页面文案、关键截图路径）
- **AND** sub-agent SHALL 继续下一个场景

### 需求: 主会话 SHALL 在拿到含 ⏭ 的报告后用 AskUserQuestion 处理回环

sub-agent 不能向用户提问。主会话拿到 sub-agent 报告后，若报告包含被跳过的场景（⏭），MUST 用 AskUserQuestion 让用户选择：补信息重跑、跳过这些场景继续归档、或暂停去修复。

#### 场景: 报告含 ⏭ 场景

- **GIVEN** sub-agent 返回的报告含至少一个 ⏭ 场景
- **WHEN** 主会话展示报告完毕
- **THEN** 主会话 SHALL 弹出 AskUserQuestion，提供至少三个选项：补信息重跑、跳过继续归档、暂停修复
- **AND** 用户选择"补信息重跑"时 SHALL 收集所需信息（URL/账号/数据）并重新 spawn sub-agent

#### 场景: 报告无 ⏭ 场景

- **GIVEN** sub-agent 返回的报告不含任何 ⏭ 场景
- **WHEN** 主会话展示报告完毕
- **THEN** 主会话 MUST NOT 弹出回环 AskUserQuestion
- **AND** SHALL 按现有 review 流程提示后续操作（archive 或修复）

### 需求: sub-agent MUST NOT 将敏感信息复述到报告

当主会话回环 spawn sub-agent 并注入凭据/账号/数据时，sub-agent MUST NOT 在报告正文中复述这些信息。截图前 MUST 注意敏感字段（密码、token、邮箱），可疑信息 SHOULD 以占位符替代或截取不含敏感区域的截图。

#### 场景: 用户提供测试账号后重跑

- **GIVEN** 主会话回环时用户提供了测试账号和密码
- **WHEN** sub-agent 重新执行场景并完成登录
- **THEN** 报告中 MUST NOT 出现该账号的密码原文
- **AND** 账号信息 SHOULD 以脱敏形式出现（如 `test***@example.com`）
- **AND** 截图 SHOULD 避开密码输入框或对其打码

### 需求: skill 模板和 command 模板 MUST 保持一致

`packages/config/templates/skills/review.md` 与 `packages/config/templates/commands/review.md` 的流程描述、AskUserQuestion 文案、sub-agent prompt 内容 MUST 保持一致，仅在"调用入口"措辞上允许差异（skill 是自动触发，command 是用户显式调用）。

#### 场景: 模板更新

- **GIVEN** 开发者修改了 skill 模板的 review 流程
- **WHEN** 提交变更
- **THEN** command 模板 MUST 同步修改
- **AND** `pnpm generate` SHALL 重新生成 `src/generated/skill-templates.ts` 和 `command-templates.ts`
- **AND** `pnpm build` SHALL 通过
