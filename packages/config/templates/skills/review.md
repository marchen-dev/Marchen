---
name: marchen-review
description: 对照变更意图检查代码实现的完整性和一致性，支持基于 chrome-devtools MCP 的 UI 场景验证。
---

对照变更的 artifact 检查代码改动，必要时驱动浏览器验证 UI 行为，报告遗漏、偏差和阻塞。

---

**输入**：用户的请求应包含变更名称，或可从上下文推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 `marchen list --json` + **AskUserQuestion** 让用户选

   显示："Review 变更: `<name>`"

2. **嗅探 diff 中的 UI 文件**

   执行：

   ```bash
   git diff --name-only HEAD | grep -E '\.(tsx?|jsx?|vue|svelte|astro|css|scss|less|html)$' || true
   ```

   保存命中文件列表（可能为空），用于下一步的提示。

3. **AskUserQuestion 选择 review 模式**

   用 **AskUserQuestion** 让用户三选一：

   - **代码 review**（默认）：对照 artifact 检查 git diff，不跑代码
   - **UI 验证**：用 chrome-devtools MCP 实际打开页面验证 specs 中的场景
   - **两者都做**：先代码、再 UI

   若上一步命中 UI 文件，在问题描述里附一句："检测到 diff 涉及 UI 文件（<列出命中文件>），建议选 UI 验证或两者都做。"
   未命中时不附加提示，默认推荐"代码 review"。

   保存用户选择为 `<mode>`。

4. **Spawn sub-agent 执行 review**

   spawn 一个 sub-agent，把 `<name>` 和 `<mode>` 代入，传入以下 prompt：

   ```
   你是 reviewer，负责检查变更 "<name>" 的代码改动是否完整实现了变更意图。
   本次 review 模式：<mode>（"代码 review" / "UI 验证" / "两者都做"）。

   ## 公共：获取意图与改动

   1. 执行 `marchen instructions <name> apply --json`，从返回 JSON 的
      `context` 数组里读取 `status` 为 "filled" 的 artifact（proposal/specs/
      design/tasks）作为变更意图。
   2. 执行 `git diff HEAD`；为空则 `git diff HEAD~1`；仍为空则报告
      "未检测到代码改动" 并结束。

   ## 代码 review 部分（mode 为 "代码 review" 或 "两者都做" 时执行）

   逐条对照变更意图和代码改动：

   **任务完成度** — tasks 中每个任务是否有对应改动：
   - ✅ 任务: <描述> — 已实现
   - ❌ 任务: <描述> — 未找到对应改动

   **一致性检查** — 实现是否符合 design 决策：
   - ✅ <决策> — 已遵守
   - ⚠️ <决策> — 实现有偏差：<说明>

   **需求覆盖** — specs 中需求是否被覆盖：
   - ✅ <需求> — 已覆盖
   - ❌ <需求> — 未覆盖

   **发现的问题（如有）**
   - <文件:行号> <问题描述>

   全部通过：输出 "✅ 代码 review 通过。"

   ## UI 验证部分（mode 为 "UI 验证" 或 "两者都做" 时执行）

   ### a. 检测 chrome-devtools MCP 可用性

   尝试调用 chrome-devtools MCP 的只读探测工具（例如列出已打开的页面）。
   工具不存在或调用失败 → 在报告里写：
   "⏭ chrome-devtools MCP 不可用，跳过 UI 验证。
    安装方法：`npx chrome-devtools-mcp@latest`，并参考所用 AI 工具的
    MCP 配置文档将其注册。"
   然后跳过本节剩余步骤。

   ### b. 提取待验证场景

   优先从变更的 specs 文件中提取所有 `#### 场景:` 块（按 spec 文件分组）。
   若 specs 不存在或不含场景 → 退化到从 tasks/proposal 推断 UI 相关验证点，
   并在报告中标注 "基于 tasks 推断，覆盖度可能不完整"。
   两者都没有可提取场景 → 报告 "未找到可验证的 UI 场景" 并跳过本节。

   ### c. 推断 dev server URL

   从项目配置中推断 dev server 地址，不要硬猜端口：
   - 读 `package.json` 的 `scripts.dev`（或 `start` / `serve`）找显式端口
     参数（`--port`、`-p` 等）
   - 读框架配置文件确认默认端口和路径：
     `vite.config.*`、`next.config.*`、`nuxt.config.*`、
     `vue.config.*`、`svelte.config.*`、`astro.config.*`、
     `webpack.config.*`、`angular.json`、`vercel.json` 等
   - 读 `.env` / `.env.local` / `.env.development` 中的
     `PORT` / `VITE_PORT` / `NEXT_PUBLIC_PORT` 等
   - 必要时查 README 的"开发"或"启动"章节

   推出候选 URL 后用 chrome-devtools MCP 的导航工具打开，再用快照工具
   确认页面像被测应用（合理 title、含框架 root 节点或变更描述涉及的
   标志性内容）。看着不像被测应用 → 当作未能推断。

   推不出来 URL，或推出来后导航失败（dev server 未启动）、或页面与
   被测应用不符 → 把所有场景标记为 ⏭ "URL unknown"，在报告中说明
   推断依据（"读到 vite.config.ts 配置 port=5173 但导航失败"），
   提示用户启动 dev server 或确认地址后重新运行 review。

   ### d. 乐观执行场景

   对每个待验证场景：
   1. 用 chrome-devtools MCP 的导航工具打开对应路径
   2. 用快照工具观察页面状态
   3. 把场景的 GIVEN/WHEN/THEN 翻译成具体交互（点击、填写、读取文本）
      并执行
   4. 比对页面状态与场景预期

   遇到阻塞（登录墙、权限不足、缺数据、表单需要真实输入等），MUST NOT
   尝试绕过、登录或猜测数据：
   - 记录场景为 ⏭ + 阻塞原因（如 "需要登录"/"需要 admin 权限"/"缺测试数据"）
   - 立即跳到下一个场景

   场景翻译不出具体操作（例如纯后端行为描述）→ ⏭ "不适合 UI 验证"。

   ### e. UI 报告格式

   ```
   ## UI 验证（chrome-devtools MCP）

   测试目标：<URL 或 "未确定">

   ✅ <场景标题> — 通过
        说明：<可选简述>
   ❌ <场景标题> — 失败
        证据：<console error 摘要 / 页面文案 / 关键截图路径>
   ⏭ <场景标题> — 跳过：<阻塞原因>
   ```

   ## 约束

   - 重点检查完整性和一致性，不做风格审查
   - 不报告缺少注释
   - 不要修改任何代码，只报告
   - UI 验证仅做必要交互；阻塞即停，不要硬闯（不登录、不猜数据、
     不尝试绕过权限）
   - sub-agent 不直接向用户提问；缺信息就在报告里以 ⏭ 标注
   - 注入到 prompt 的凭据/账号/数据：MUST NOT 在报告正文中复述
   - 截图前评估是否含敏感字段（密码、token、邮箱）；可疑信息以
     占位符替代或截取不含敏感区域的截图
   ```

5. **展示报告并按结果分支**

   把 sub-agent 返回的报告原样展示给用户。

   - **全部通过且无 ⏭**：提示 "可以用 `marchen archive <name>` 归档。"
   - **有 ❌ 失败**：提示用户修复后可以再次 review。
   - **有 ⏭ 跳过**：用 **AskUserQuestion** 让用户选择：
     - **补信息重跑**：收集所需信息（dev server URL、测试账号、数据准备等），
       重新 spawn sub-agent，把信息注入 prompt 后再跑一次 UI 验证
     - **跳过这些场景，继续归档**：保留报告，提示 `marchen archive <name>`
     - **暂停去修复**：什么都不做

     选择"补信息重跑"时，按报告中 ⏭ 的具体阻塞类型向用户收集所需信息
     （自由文本），把信息作为附加上下文塞进新 sub-agent 的 prompt 末尾，
     并明确告知 sub-agent 不要把这些信息复述到报告里。

**护栏**

- 必须使用 sub-agent 执行 review，不要在主会话中读 diff 或驱动浏览器
- 不要修改任何代码，只报告
- sub-agent 不向用户提问；所有问答在主会话用 AskUserQuestion
- UI 验证阻塞即停，不要硬闯（不登录、不猜数据、不绕权限）
- 不管理 dev server 生命周期；起服务是用户的事
- 用户提供的凭据/账号等敏感数据：仅注入到 sub-agent prompt，不写入任何 artifact，不复述到报告
- 使用 AskUserQuestion 时，选项不超过 4 个
