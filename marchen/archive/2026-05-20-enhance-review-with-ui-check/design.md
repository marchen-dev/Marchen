## 背景

`marchen-review` 是 apply 完成后、archive 前的检查环节，由 skill 在主会话里 spawn 一个 sub-agent，sub-agent 读 `git diff` 对照 artifact 报告完整性和一致性。报告止于代码层——能告诉用户"这个 task 没找到对应改动"，但不能告诉用户"这个页面跑起来到底对不对"。

chrome-devtools MCP（`chrome-devtools-mcp` npm 包）作为标准 MCP server 已在主流 AI 工具中通用，提供 navigate、snapshot、click、fill、console、network 等浏览器自动化工具。把它注入到 review sub-agent 的工具集中，就能把验证从静态扩展到运行时。

## 目标与非目标

**目标：**

- 让 review 在代码对照基础上可选执行 UI 场景验证，由用户在主会话显式选择启用
- 复用现有 specs 的 `#### 场景:` 块作为 UI 测试脚本来源（spec 已是 BDD 风格）
- 失败模式优雅：chrome-devtools MCP 不可用就降级；阻塞即停不硬闯
- 不增加 CLI/包代码改动，纯模板层完成

**非目标：**

- 不替代项目自己的 E2E 测试框架（Playwright/Cypress 等）
- 不管理 dev server 生命周期，sub-agent 不负责启动/关闭服务
- 不引入 config.yaml 新字段（如 review.targetUrl）；URL 走 sub-agent 自动探活
- 不为不支持 MCP 的工具做差异化处理；MCP 不可用就降级，不分 provider
- 不内置登录、数据初始化等"测试夹具"能力；撞墙即停由用户回环补信息

## 决策

### 决策 1：模式选择放在主会话，不放 sub-agent

**为什么**：sub-agent 是非交互执行环境，不能调用 AskUserQuestion。用户意图（要做代码 review / UI 验证 / 两者）必须在主会话先收集。环境/数据信息则交给 sub-agent 在执行中自己探测，避免事前预问让用户预判失败模式。

**实现位置**：`templates/skills/review.md` 的步骤 3，spawn sub-agent 之前。

### 决策 2：diff 嗅探只作"建议"，不替用户决定

**为什么**：嗅探是辅助信息，硬性触发会偏离"完全由用户判断"的设计原则。结果作为提示附在 AskUserQuestion 描述里，所有三个选项始终可选。

**命中规则**：`git diff --name-only HEAD | grep -E '\.(tsx?|jsx?|vue|svelte|astro|css|scss|less|html)$'`。命中则在 AskUserQuestion 描述里加一句"检测到 diff 涉及 UI 文件（<列表>），建议选 UI 验证或两者都做"。

### 决策 3：sub-agent 不预问 prep，乐观执行 + 阻塞即停

**为什么**：sub-agent 不能调 AskUserQuestion，事前问的"登录态/账号/数据"必须由主会话代收，但这意味着用户得抽象地预测失败模式。直接执行更友好：sub-agent 有 chrome mcp 这双"眼睛"，能 navigate → snapshot 之后基于具体观察判断阻塞类型，比用户事前猜测准确。

**阻塞处理**：sub-agent 撞登录墙/权限墙/缺数据时 MUST NOT 绕过或猜数据，立即记录 ⏭ 跳到下一场景。主会话拿到含 ⏭ 的报告后再用 AskUserQuestion 决定补信息重跑、跳过、还是暂停修复。

### 决策 4：从项目配置推断 dev server URL，不硬扫端口

**为什么**：硬编码端口列表是"瞎蒙"，与变更里其他决策（让 sub-agent 基于观察而非预测）冲突。项目里 dev 端口的真相已经写在 `package.json` 脚本、框架配置文件、`.env` 等可读位置，sub-agent 完全可以读出来。这样：
- 不会误命中本机其他进程（5173 可能是别的 Vite 项目）
- 报告里能给出"为什么是这个 URL"的依据
- 对非 Node/Web 项目（如 Astro、Angular、自定义 dev server）也成立

**推断步骤**：读 `scripts.dev`/`scripts.start`/`scripts.serve` 中的端口参数 → 读框架配置文件的 server.port 或等价字段 → 读 `.env*` 中的 PORT 类变量 → 必要时查 README。推不出 URL 或推出来后导航失败/页面不像被测应用 → 全部场景 ⏭ "URL unknown" 并在报告中给出推断依据。

**为什么不引入 config.yaml 新字段**：会跨 shared/config/cli 多包，把"纯模板改动"升级为重大变更，与本变更范围不符；项目源里的配置已经够用，无需额外信息源。

### 决策 5：specs 场景作为唯一权威的 UI 测试脚本来源

**为什么**：marchen 的 specs 已强制 `#### 场景:` BDD 风格，本来就是可测试的行为描述。把它直接当作 UI 测试脚本最低成本，避免引入新的"测试场景"描述格式。

**回退**：specs 缺失或不含场景时 MAY 退化到 tasks/proposal 推断；仍无则报告 "未找到可验证的 UI 场景" 并跳过。

### 决策 6：chrome-devtools MCP 不可用时静默降级

**为什么**：marchen 支持 10 个 AI 工具，并非所有用户都装了 chrome-devtools MCP。失败应该是 graceful 的——不阻断整个 review 流程。

**检测方式**：sub-agent 用 `mcp__chrome-devtools__list_pages` 或类似只读工具 probe，工具不存在或调用失败即降级，在报告里标注并附上安装提示。

### 决策 7：模板 prompt 一体化，不拆 sub-prompt 文件

**为什么**：当前 review.md ~88 行，扩展后 ~140 行。一个完整 prompt 在维护时更易读，避免跨文件跳转。skills 和 commands 两份模板保持一致由 codegen 保障。

## 风险与权衡

### 风险 1：sub-agent 不熟悉 chrome-devtools MCP 工具集，执行不稳

各家 AI 工具对 MCP 工具的命名约定略有差异（如 `mcp__chrome-devtools__navigate_page` vs `chrome-devtools.navigate_page`）。template 里写硬名可能不通用。

**缓解**：在 sub-agent prompt 里描述工具用途而非死扣具体名称，例如"使用 chrome-devtools MCP 的导航工具打开 URL"。让 sub-agent 在自己的工具集里自己匹配。

### 风险 2：探活 dev server 时可能误命中无关进程

5173 端口可能不是用户的 dev server。但探活 + take_snapshot 后页面内容能让 sub-agent 自己判断"这页面看起来不是被测应用"，从而 ⏭。代价是多耗几次 navigate。

**缓解**：在 prompt 里要求 sub-agent 探活成功后用 snapshot 验证页面是否像被测应用（如检查 title、有无 React/Vue/Svelte 等 root 节点）。不像就继续探下一个端口。

### 风险 3：sub-agent 报告里泄露敏感数据

回环 spawn 时用户提供的凭据会进 sub-agent prompt，console message 或截图也可能带出来。

**缓解**：在 sub-agent prompt 的"约束"章节强制：不复述凭据、截图前评估敏感字段、可疑信息用占位符。这是 best-effort，无法完全杜绝；用户自己也要审视报告再决定是否归档。

### 风险 4：模板膨胀降低可读性

review.md 从 ~88 行变 ~140 行，初次阅读会觉得重。

**缓解**：分两个明显的章节（代码 review / UI 验证），代码 review 部分基本不变；新内容集中在一处独立块，老用户跳过即可。

### 风险 5：specs 中的"场景"风格不一定能直接执行

marchen 的 specs 场景是用 GIVEN/WHEN/THEN 写的，但描述粒度可能更偏需求层而非操作层（"用户能登录"而非"点击 #login-btn"）。

**权衡**：让 sub-agent 在执行时把场景描述翻译成具体操作（这是 LLM 擅长的）；翻译失败的场景就 ⏭。比强制要求用户用更细的 selector 风格写 spec 更友好。
