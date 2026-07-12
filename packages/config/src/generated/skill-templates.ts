// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改

export const SKILL_APPLY = `---
name: marchen-apply
description: 按变更的 tasks.md 逐个实现任务。适用于用户想按任务清单逐步实现代码。
---

按变更的 tasks.md 逐个实现任务，完成后勾选 checkbox。

---

**输入**：用户的请求应包含变更名称，或可从上下文推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   显示："使用变更: \`<name>\`"

2. **获取实现指令**

   \`\`\`bash
   marchen instructions <name> apply --json
   \`\`\`

   返回 JSON 包含：
   - \`state\`：\`"ready"\` / \`"blocked"\` / \`"all_done"\`
   - \`progress\`：\`{ total, completed, remaining }\`
   - \`context\`：所有 artifact 的信息数组，每项包含 \`id\`、\`status\`、\`path\`、\`content\`
   - \`instruction\`：实现指引
   - \`changeDir\`：变更目录绝对路径

   根据 \`state\` 处理：
   - \`"blocked"\` → 提示先完成 artifacts
   - \`"all_done"\` → 提示归档
   - \`"ready"\` → 继续

3. **显示进度**

   从返回的 JSON 读取并显示：
   "变更: \`<name>\` | 进度: N/M | 下一个: <第一个未完成任务的描述>"

4. **逐个实现任务**

   从 \`context\` 中读取所有 artifact 内容作为上下文。

   对每个未完成任务：
   - 显示 "任务 N/M: <描述>"
   - 实现代码改动
   - 在 tasks.md 中勾选：\`- [ ]\` → \`- [x]\`
     文件路径：\`<changeDir>/tasks.md\`
   - 显示 "✓ 完成"
   - 继续下一个

   **暂停条件：**
   - 任务不清晰 → 询问用户
   - 发现设计问题 → 建议用 \`/marchen:update\` 修订计划
   - 遇到错误或阻塞 → 报告并等待
   - 用户中断

5. **显示结果**

   全部完成时：
   "全部完成 (N/N)，可以用 \`marchen review <name>\` 检查实现，或直接 \`marchen archive <name>\` 归档。"

   暂停时：
   "暂停于任务 N/M: <原因>"

**护栏**

- 实现前必须读 context 中的 artifact 内容
- 每完成一个任务立即勾选 checkbox，不要攒着
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- 如果实现过程中遇到不确定的设计决策，可以用 \`marchen search "<关键词>" --json\` 搜索历史变更中的相关方案
- \`instruction\` 是给你的指引，不要原样复制到代码注释中
`

export const SKILL_ARCHIVE = `---
name: marchen-archive
description: 归档已完成的变更。检查完成度后执行归档，适用于实现完毕后收尾。
---

归档已完成的变更，检查完成度后执行归档。

---

**输入**：用户的请求可包含变更名称（如 \`/marchen:archive add-auth\`），也可不带。

**流程**

1. **确定变更名称**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   **重要**：不要猜测或自动选择，必须让用户确认。

2. **检查完成度**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   解析 JSON，检查：
   - \`artifacts\`：每个 artifact 的 \`status\` 是否为 \`filled\`
   - \`tasks.completed\` vs \`tasks.total\`（\`tasks\` 为 null 时视为无任务，跳过检查）

   **如果全部完成：** 直接进入下一步。

   **如果有未完成的 artifact 或 task：**
   - 显示警告，列出未完成项
   - 用 **AskUserQuestion** 确认是否继续
   - 用户确认后继续，不阻塞

3. **生成摘要**

   读取 \`marchen/changes/<name>/proposal.md\`，从中生成一句话中文摘要（≤50字），概括这次变更做了什么。摘要应包含关键语义词，便于后续 AI 检索。

4. **执行归档**

   \`\`\`bash
   marchen archive <name> --summary "<生成的摘要>" --json
   \`\`\`

   解析返回的 JSON 获取归档结果。

5. **显示结果**

   \`\`\`
   变更 "<name>" 已归档
   Schema: <schema>
   归档到: <archivedTo>
   \`\`\`

   如有警告（未完成项），一并显示。

**护栏**

- 未提供名称时必须用 AskUserQuestion 让用户选择
- 用 \`status --json\` 检查完成度，不要自己读文件判断
- 警告不阻塞归档，只提醒 + 确认
- 使用 AskUserQuestion 时，选项不超过 4 个
`

export const SKILL_EXPLORE = `---
name: marchen-explore
description: 进入探索模式 — 思考想法、调查问题、厘清需求。适用于用户想在动手之前先理清思路。
---

进入探索模式。深入思考，自由可视化，跟随对话走向任何方向。

**重要：探索模式只用于思考，不用于实现。** 可以读文件、搜索代码、调查代码库，但绝不能写代码或实现功能。如果用户要求实现，提醒他们先退出探索模式并用 \`/marchen:propose\` 创建变更。可以创建 Marchen artifact（proposal、design、spec）——那是捕获思考，不是实现。

**这是一种姿态，不是工作流。** 没有固定步骤、没有必须的顺序、没有强制输出。你是帮助用户探索的思考伙伴。

**输入**：\`/marchen:explore\` 后面可以跟任何内容：
- 模糊的想法："实时协作"
- 具体的问题："auth 系统越来越难维护了"
- 变更名称："add-dark-mode"（在该变更上下文中探索）
- 方案比较："postgres vs sqlite"
- 什么都不带也行

---

## 姿态

- **好奇，不武断** — 提出自然涌现的问题，不按脚本走
- **开放线索，不审问** — 展示多个有趣方向，让用户跟随感兴趣的。不要把他们引导到单一路径上
- **视觉化** — 大量使用 ASCII 图表来辅助思考
- **自适应** — 跟随有趣的线索，有新信息时及时转向
- **耐心** — 不急于下结论，让问题的形状自然浮现
- **接地气** — 在相关时探索实际代码库，不要空谈理论

---

## 你可以做什么

根据用户带来的内容，你可能会：

**探索问题空间**
- 提出从用户所说内容中自然涌现的澄清问题
- 挑战假设
- 重新框定问题
- 寻找类比

**调查代码库**
- 映射与讨论相关的现有架构
- 找到集成点
- 识别已有的模式
- 发现隐藏的复杂性

**比较方案**
- 头脑风暴多种方案
- 构建比较表
- 勾勒权衡
- 推荐路径（如果被问到）

**可视化**
\`\`\`
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │ State  │────────▶│ State  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   System diagrams, state machines,      │
│   data flows, architecture sketches,    │
│   dependency graphs, comparison tables  │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**发现风险和未知**
- 识别可能出错的地方
- 找到理解上的空白
- 建议 spike 或调查

---

## Marchen 感知

你了解 Marchen 系统。自然地使用它，不要强制。

### 检查上下文

开始时快速检查现有状态和历史：

1. 当前变更：
\`\`\`bash
marchen list --json
\`\`\`

2. 变更历史概览：
\`\`\`bash
cat marchen/changelog.md
\`\`\`
这是所有已归档变更的索引，每条包含日期、变更名和一句话摘要。先扫一遍找到与用户话题相关的条目。如果找到，直接读对应 archive 目录下的 proposal.md 或 design.md 了解详情。

3. 语义搜索：

这是 RAG 搜索，不是 grep——构造语义完整的短语，不要用单个泛词。

\`\`\`bash
marchen search "<语义完整的查询短语>" --json
\`\`\`

**查询构造指引：**
- 用描述性短语，不用单个词：
  "初始化适配多个 agent 客户端" → \`"multi-agent provider 初始化"\`
  "之前怎么处理错误的" → \`"错误处理 error handling 重构"\`
  "暗色模式的设计决策" → \`"dark mode 设计方案"\`
- 中英文混合效果更好（归档内容里中英都有）
- 如果结果不理想，换个角度重新构造查询

如果有匹配结果（score >= 0.4），读取对应 archive 目录下的 design.md 或 proposal.md 了解详细决策。

如果 \`marchen search\` 不可用（命令报错），回退到 changelog.md + 手动读 archive 目录。

这告诉你：
- 是否有进行中的变更
- 它们的名称、schema 和状态
- 项目过去做过哪些变更
- 用户可能在做什么

如果用户提到了特定变更名称，读取它的 artifact 作为上下文。

### 没有变更时

自由思考。当洞察结晶时，根据复杂度推荐下一步：

**判断标准：**
- \`/marchen:lite\` — bug 修复、小改动、单一任务组、不需要设计文档
- \`/marchen:propose\` — 新功能、多步骤、需要 design/specs、涉及多模块

**推荐方式：** 直接在回复中输出推荐，说明理由，让用户自行输入命令。示例：

> 想法差不多成型了。这个改动比较简单（只涉及一个文件的小调整），建议用 \`/marchen:lite\` 直接走轻量流程。
>
> 如果你觉得需要更完整的设计文档，也可以用 \`/marchen:propose\`。

根据讨论内容给出你的推荐和理由，但让用户自己决定输入哪个命令。

### 有变更时

如果用户提到了变更或你发现某个变更相关：

1. **读取已有 artifact 作为上下文**
   - \`marchen/changes/<name>/proposal.md\`
   - \`marchen/changes/<name>/design.md\`
   - \`marchen/changes/<name>/tasks.md\`
   - 等

2. **在对话中自然引用**
   - "你的 design 提到用 Redis，但我们刚发现 SQLite 更合适……"
   - "proposal 把范围限定在付费用户，但我们现在觉得应该面向所有人……"

3. **在做出决策时提议捕获**

   | 洞察类型 | 捕获到哪里 |
   |---------|-----------|
   | 发现新需求 | \`specs/<capability>/spec.md\` |
   | 需求变更 | \`specs/<capability>/spec.md\` |
   | 做出设计决策 | \`design.md\` |
   | 范围变更 | \`proposal.md\` |
   | 发现新工作 | \`tasks.md\` |
   | 假设被推翻 | 相关 artifact |

   示例：
   - "这是一个设计决策。要记录到 design.md 吗？"
   - "这是新需求。要加到 specs 里吗？"
   - "这改变了范围。要更新 proposal 吗？"

4. **用户决定** — 提议后继续。不施压，不自动捕获。

---

## 不必做的事

- 按脚本走
- 每次问同样的问题
- 产出特定 artifact
- 得出结论
- 如果有价值的岔路就不必守住话题
- 简短（这是思考时间）

---

## 结束探索

没有固定的结束方式。探索可能：

- **流向下一阶段**：用 **AskUserQuestion** 提供 \`/marchen:lite\` 和 \`/marchen:propose\` 选项，附带推荐理由
- **更新 artifact**："已将这些决策更新到 design.md"
- **只是提供清晰度**：用户得到了需要的，继续前进
- **稍后继续**："随时可以继续"

当想法结晶时，你可以提供总结——但不是必须的。有时候思考过程本身就是价值。

---

## 护栏

- **不实现** — 绝不写代码或实现功能。创建 Marchen artifact 可以，写应用代码不行
- **不伪装理解** — 不清楚就深挖
- **不催促** — 探索是思考时间，不是任务时间
- **不强制结构** — 让模式自然浮现
- **不自动捕获** — 提议保存洞察，不要直接做
- **要可视化** — 一张好图胜过千言万语
- **要探索代码库** — 让讨论扎根于现实
- **要质疑假设** — 包括用户的和你自己的
`

export const SKILL_LITE = `---
name: marchen-lite
description: 一键式轻量变更流程。创建 lite 变更、实现任务、询问归档，一气呵成。适合 bug 修复、小改动。
---

一键式轻量变更 — 使用 lite schema 创建变更，自动实现任务，完成后询问归档。
适合 bug 修复、小改动、explore 之后的快速执行。

---

**输入**：用户的请求应包含变更名称（kebab-case）或变更描述。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述中提取 kebab-case 名称（如"修复登录 bug" → \`fix-login-bug\`）。

   如果没有输入，用 **AskUserQuestion** 工具询问：
   > "你想做什么变更？描述一下你要构建或修复的内容。"

   从回答中提取 kebab-case 名称。

   **重要**：必须理解用户想做什么才能继续。

2. **创建变更目录**

   \`\`\`bash
   marchen new <name> --schema lite
   \`\`\`

   创建 \`marchen/changes/<name>/\` 目录，包含 \`.metadata.yaml\` 和 \`tasks.md\` 骨架。

   如果同名变更已存在，用 **AskUserQuestion** 询问用户是继续已有变更还是换个名称。

3. **获取 tasks 指令**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   确认变更创建成功，然后获取 tasks 的创建指令：

   \`\`\`bash
   marchen instructions <name> tasks --json
   \`\`\`

   返回 JSON 包含：
   - \`template\`：tasks.md 的骨架结构（含 \`## 背景\` 章节）
   - \`instruction\`：如何填充 tasks 的指导文本
   - \`outputPath\`：写入路径（\`tasks.md\`）
   - \`context\`：上下文信息（lite schema 下为空数组）

4. **填充 tasks.md**

   根据用户描述 + \`instruction\` 指引 + \`template\` 结构，填充 tasks.md：
   - \`## 背景\`：简要说明变更目的和方案
   - 任务列表：按组分类，checkbox 格式

   写入 \`marchen/changes/<name>/tasks.md\`。

   如果用户描述太模糊，用 **AskUserQuestion** 澄清关键信息。

5. **开始实现**

   获取实现指令：

   \`\`\`bash
   marchen instructions <name> apply --json
   \`\`\`

   返回 JSON 包含：
   - \`state\`：\`"ready"\` / \`"blocked"\` / \`"all_done"\`
   - \`progress\`：\`{ total, completed, remaining }\`
   - \`context\`：所有 artifact 的信息数组
   - \`instruction\`：实现指引
   - \`changeDir\`：变更目录绝对路径

   显示："变更: \`<name>\` | 任务: 0/N | 开始实现..."

   对每个未完成任务：
   - 显示 "任务 N/M: <描述>"
   - 实现代码改动
   - 在 tasks.md 中勾选：\`- [ ]\` → \`- [x]\`
     文件路径：\`<changeDir>/tasks.md\`
   - 显示 "✓ 完成"
   - 继续下一个

   **暂停条件：**
   - 任务不清晰 → 询问用户
   - 发现设计问题 → 建议用 \`/marchen:update\` 修订计划
   - 遇到错误或阻塞 → 报告并等待
   - 用户中断

   暂停时显示："暂停于任务 N/M: <原因>"，流程结束。

6. **全部完成 → 询问归档**

   所有任务完成后，用 **AskUserQuestion** 询问：

   > "全部任务已完成 (N/N)，是否归档这个变更？"
   > - 归档
   > - 暂不归档

   **如果用户选择归档：**

   读取 \`marchen/changes/<name>/tasks.md\` 的背景段，生成一句话中文摘要（≤50字）。

   \`\`\`bash
   marchen archive <name> --summary "<摘要>" --json
   \`\`\`

   显示：
   \`\`\`
   变更 "<name>" 已归档
   归档到: <archivedTo>
   \`\`\`

   **如果用户选择暂不归档：**

   显示："好的，后续可以用 \`/marchen:archive <name>\` 归档。"

**护栏**

- 必须使用 \`--schema lite\` 创建变更
- tasks.md 的 \`## 背景\` 章节必须填写，不能留空
- 任务粒度要小到一个会话内能完成
- 如果上下文关键信息不清楚，询问用户；但小疑问优先做合理判断，保持节奏
- 已存在同名变更时必须询问用户，不要覆盖
- 实现前必须读 context 中的 artifact 内容
- 每完成一个任务立即勾选 checkbox，不要攒着
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- \`instruction\` 是给你的指引，不要把它原样复制到代码注释或 tasks.md 中
- 使用 AskUserQuestion 时，选项不超过 4 个
`

export const SKILL_PROPOSE_PREVIEW = `---
name: marchen-propose-preview
description: 预览 propose 生成的变更摘要。从 proposal/design/specs/tasks 浓缩为终端卡片，便于人快速 review，决定下一步是 apply 还是改 propose。
disable-model-invocation: true
argument-hint: <change-name>
---

预览一个变更的浓缩摘要 — 纯终端输出，不写文件。

适用于 propose 完成后人快速 review，避免来回翻 4~7 个 artifact 文件。

---

**输入**：用户的请求应包含变更名称，或可从上下文推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   显示："Preview 变更: \`<name>\`"

2. **获取 artifact 内容**

   \`\`\`bash
   marchen instructions <name> apply --json
   \`\`\`

   返回 JSON 包含：
   - \`schemaName\`：\`"full"\` / \`"lite"\`
   - \`state\`：\`"ready"\` / \`"blocked"\` / \`"all_done"\`
   - \`progress\`：\`{ total, completed, remaining }\`
   - \`context\`：所有 artifact 的内容数组（\`id\` / \`status\` / \`content\`）

   **如果 state 为 \`blocked\`**：打印 "变更未填完，先用 /marchen:propose 补齐 artifact 再预览"，结束。不要强行摘要半成品。

3. **生成卡片并直接打印**

   根据 \`schemaName\` 选模板：
   - \`full\` → 四段：改了什么 / 关键决策 / 影响范围 / 风险
   - \`lite\` → 两段：改了什么 / 任务概览

   严格按下面的"摘要规则"生成，输出为单个卡片，禁止加任何解释段落。

4. **末尾追加一行下一步提示**

   \`\`\`
   /marchen:apply <name>           开始实现
   /marchen:update <name>          修订细节（方案、需求、任务的局部调整）
   /marchen:propose <name>         重新提案（变更意图或方向改变）
   \`\`\`

---

## 摘要规则（必须严格遵守）

**通用约束：**

- 卡片框宽 70 字符（含 \`│\` 边框），便于主流终端整齐显示
- 每行内容（去掉边框后）≤ 60 字符；超出必须截断/合并/重写，不许折行
- 禁止粘贴 artifact 原文片段，所有内容必须重新组织、压缩
- 中文为主，技术名词保留英文（如 \`SearchManager\`、\`SDK\`）
- 宁可少写，不要堆。摘不下就合并或截断，在框底加 \`更多详情见 marchen/changes/<name>/\`

**full schema 段落上限：**

| 段落     | 上限             | 来源                            |
|---------|------------------|---------------------------------|
| 改了什么 | 6 条 bullet      | proposal 的"能力"小节           |
| 关键决策 | 5 条 bullet      | design 的"决策"小节             |
| 影响范围 | 8 节点 ASCII 图  | proposal 的"影响范围" + design  |
| 风险    | 3 条 bullet      | design 的"风险与权衡"           |

**lite schema 段落上限：**

| 段落     | 上限             | 来源                          |
|---------|------------------|-------------------------------|
| 改了什么 | 6 条 bullet      | tasks.md 任务组标题 + 推断    |
| 任务概览 | 1 行/任务组      | tasks.md 一级标题 + 完成进度  |

**影响范围图退化策略：**

如果节点数超 8 个 / 关系不清晰 / 没有明显依赖结构 → 改用 bullet 列模块名，不要硬画歪斜的 ASCII。

**任务进度条规则（lite）：**

进度条固定 10 格宽，按 \`completed/total\` 比例画。例如 \`8/8\` → \`██████████\`，\`3/5\` → \`██████░░░░\`。

---

## 输出样例

**full schema：**

\`\`\`
╭─ <name> ────────────────────────────── full · <N> 任务 ─╮
│                                                          │
│  <一句话动机，从 proposal "动机" 段提炼，≤ 55 字>         │
│                                                          │
│  ━━ 改了什么 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   ✚ <capability-name>     <一句话能力描述>               │
│   ...                                                    │
│                                                          │
│  ━━ 关键决策 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   1. <决策内容>                                          │
│   ...                                                    │
│                                                          │
│  ━━ 影响范围 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│      <ASCII 图 或 bullet 模块列表>                       │
│                                                          │
│  ━━ 风险 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   • <风险>                                               │
│                                                          │
╰──────────────────────────────────────────────────────────╯
\`\`\`

**lite schema：**

\`\`\`
╭─ <name> ──────────────────────────── lite · <N> 任务 ─╮
│                                                       │
│  <一句话动机，从 tasks.md "背景" 段提炼>             │
│                                                       │
│  ━━ 改了什么 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   • <推断的核心变更>                                  │
│                                                       │
│  ━━ 任务概览 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   1. <任务组标题>      ██████████ N/M ✓             │
│                                                       │
╰───────────────────────────────────────────────────────╯
\`\`\`

**护栏**

- 不写文件，纯 stdout 输出
- 不调用 AskUserQuestion 询问"要打印什么"，遵守摘要规则即可
- 不展开补全 artifact 信息——artifact 里没有的，摘要里就不该有
- state 为 \`blocked\` 时拒绝生成，不强行摘要半成品
- 不要在卡片外加解释段落，只打印卡片 + 下一步提示
- \`instruction\` 字段（apply JSON 里有）是给 apply 用的，不是给 preview 的，忽略它
`

export const SKILL_PROPOSE = `---
name: marchen-propose
description: 提出新变更，创建并填充所有 artifact。适用于用户想快速描述需求并生成完整的 proposal、specs、design、tasks。
---

提出新变更 — 创建变更目录并按依赖顺序生成所有 artifact。

将创建以下 artifact：
- proposal.md（动机和变更内容）
- specs/（每个能力的需求规格）
- design.md（技术方案）
- tasks.md（实现任务清单）

完成后可用 /marchen:apply 开始实现。

---

**输入**：用户的请求应包含变更名称（kebab-case）或变更描述。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述中提取 kebab-case 名称（如"添加用户认证" → \`add-user-auth\`）。

   如果没有输入，用 **AskUserQuestion** 工具询问：
   > "你想做什么变更？描述一下你要构建或修复的内容。"

   从回答中提取 kebab-case 名称。

   **重要**：必须理解用户想做什么才能继续。

2. **创建变更目录**

   \`\`\`bash
   marchen new <name>
   \`\`\`

   创建 \`marchen/changes/<name>/\` 目录和 \`.metadata.yaml\`。

   如果同名变更已存在，用 **AskUserQuestion** 询问用户是继续已有变更还是换个名称。

3. **循环创建 artifact**

   用 **TaskCreate** 工具创建任务列表追踪进度。

   循环执行以下步骤：

   a. **查询当前状态**
      \`\`\`bash
      marchen status <name> --json
      \`\`\`
      返回 JSON 包含：
      - \`workflow.next\`：下一个应该创建的 artifact ID，全部完成时为 \`null\`
      - \`workflow.ready\`：当前可以创建的 artifact 列表
      - \`workflow.blocked\`：被阻塞的 artifact 列表
      - \`artifacts\`：每个 artifact 的状态详情（\`id\`、\`status\`、\`path\`）

      如果 \`workflow.next\` 为 \`null\` → 全部完成，跳到第 4 步。

   b. **获取创建指令**
      \`\`\`bash
      marchen instructions <name> <workflow.next> --json
      \`\`\`
      返回 JSON 包含：
      - \`template\`：artifact 的 markdown 骨架结构，用它作为输出文件的框架
      - \`instruction\`：如何填充该 artifact 的指导文本
      - \`outputPath\`：写入路径（相对于变更目录）
      - \`context\`：上下文 artifact 的信息数组，每项包含 \`id\`、\`status\`、\`content\`（已填充的内容直接在这里，不需要额外读文件）
      - \`unlocks\`：完成此 artifact 后解锁的 artifact 列表

   c. **创建 artifact**

      根据 artifact 类型处理：

      **普通 artifact（proposal / design / tasks）：**
      - 读取 \`context\` 中 \`status\` 为 \`filled\` 的 \`content\` 作为上下文
      - 按 \`instruction\` 指引 + \`template\` 结构生成内容
      - 写入 \`marchen/changes/<name>/<outputPath>\`
      - 写入后验证文件存在

      **specs（目录型 artifact，outputPath 为 \`specs/\`）：**
      - 读取 proposal 内容（在 \`context\` 中，\`id\` 为 \`proposal\` 的 \`content\`）
      - 从 proposal 的"能力"章节提取能力列表（kebab-case 名称）
      - 为每个能力：
        - 创建目录 \`marchen/changes/<name>/specs/<capability>/\`
        - 按 \`template\` 结构 + \`instruction\` 指引生成 spec 内容
        - 写入 \`specs/<capability>/spec.md\`
      - 写入后验证每个 spec 文件存在

      **如果 proposal 的上下文不够清晰**（用户描述太模糊）：
      - 用 **AskUserQuestion** 澄清关键信息
      - 然后继续创建

   d. 显示进度："已创建 \`<artifact-id>\`"，标记任务完成，回到步骤 a。

4. **显示最终状态**

   \`\`\`bash
   marchen status <name>
   \`\`\`

**输出**

完成后显示：
- 变更名称和目录位置
- 已创建的 artifact 列表及简要说明
- 用纯文字（不调用 AskUserQuestion，不自动执行）提示下一步两个并列选项，由用户自行决定：

  \`\`\`
  下一步：
    /marchen:apply <name>           直接开始实现
    /marchen:propose-preview <name> 先看一眼浓缩摘要再决定
  \`\`\`

**护栏**

- 按依赖顺序创建，不跳过 artifact
- 每次循环创建一个 artifact（specs 算一个，但包含多个文件）
- 写入后验证文件存在再继续下一个
- 如果上下文关键信息不清楚，询问用户；但小疑问优先做合理判断，保持节奏
- 已存在同名变更时必须询问用户，不要覆盖
- \`instruction\` 是给你的指引，不要把它原样复制到 artifact 文件中
- 使用 AskUserQuestion 时，选项不超过 4 个；需要更多选项时合并或分步询问
`

export const SKILL_REVIEW = `---
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
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选

   显示："Review 变更: \`<name>\`"

2. **嗅探 diff 中的 UI 改动**

   执行 \`git diff --name-only HEAD\`，判断改动是否涉及前端 UI（组件、样式、模板、静态资源等）。命中则记下命中文件，用于下一步的提示。

3. **AskUserQuestion 选择 review 模式**

   用 **AskUserQuestion** 让用户三选一：

   - **代码 review**（默认）：对照 artifact 检查 git diff，不跑代码
   - **UI 验证**：用 chrome-devtools MCP 实际打开页面验证 specs 中的场景
   - **两者都做**：先代码、再 UI

   若上一步命中 UI 文件，在问题描述里附一句："检测到 diff 涉及 UI 文件（<列出命中文件>），建议选 UI 验证或两者都做。"
   未命中时不附加提示，默认推荐"代码 review"。

   保存用户选择为 \`<mode>\`。

4. **获取意图与改动（公共前置）**

   - 执行 \`marchen instructions <name> apply --json\`，从返回 JSON 的 \`context\` 数组里读取 \`status\` 为 "filled" 的 artifact（proposal/specs/design/tasks）作为变更意图
   - 执行 \`git diff HEAD\`；为空则 \`git diff HEAD~1\`；仍为空则报告 "未检测到代码改动" 并结束

   diff 大到可能挤占 context 时，先 \`git diff --stat HEAD\` 看摘要，再按需读单个文件 diff。

5. **代码 review**（mode 为 "代码 review" 或 "两者都做" 时执行）

   逐条对照变更意图和代码改动，输出报告：

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

   遇到无法判断的情况（tasks 描述与 diff 对不上但可能是改名了、spec 表述含糊等），直接用 **AskUserQuestion** 就地问用户，不要积攒到最后。

6. **UI 验证**（mode 为 "UI 验证" 或 "两者都做" 时执行）

   ### a. 检测 chrome-devtools MCP 可用性

   尝试调用 chrome-devtools MCP 的只读探测工具（例如列出已打开的页面）。工具不存在或调用失败 → 在报告里写：

   > ⏭ chrome-devtools MCP 不可用，跳过 UI 验证。
   > 安装方法：\`npx chrome-devtools-mcp@latest\`，并参考所用 AI 工具的 MCP 配置文档将其注册。

   然后跳过本节剩余步骤。

   ### b. 提取待验证场景

   优先从变更的 specs 文件中提取所有 \`#### 场景:\` 块（按 spec 文件分组）。
   若 specs 不存在或不含场景 → 退化到从 tasks/proposal 推断 UI 相关验证点，并在报告中标注 "基于 tasks 推断，覆盖度可能不完整"。
   两者都没有可提取场景 → 报告 "未找到可验证的 UI 场景" 并跳过本节。

   ### c. 推断 dev server URL

   从项目文件（脚本、框架配置、环境变量、README 等）推断 dev server 地址和启动命令，不要硬猜端口。

   推出候选 URL 后用 chrome-devtools MCP 的导航工具打开，再用快照工具确认页面像被测应用（合理 title、含框架 root 节点或变更描述涉及的标志性内容）。看着不像被测应用 → 当作未能推断。

   推不出 URL → 全部场景 ⏭ "URL unknown"，在报告里说明推断依据，提示用户确认地址后重新运行 review，跳过本节执行步骤。

   ### d. 推断到 URL 但 dev server 未启动 → 询问是否帮忙起

   推出来 URL 但导航失败（连接拒绝）→ 主会话 **AskUserQuestion**，附上推断依据和启动命令：

   - **帮我起 dev server 然后继续**
   - **我手动起，起完告诉你**
   - **跳过 UI 验证**

   选"帮我起"：
   1. 用 Bash 的 \`run_in_background\` 执行推断到的启动命令（如 \`pnpm dev\`、\`npm run dev\`）
   2. 轮询端口直到可访问；出现明显异常（进程退出 / 长时间无任何输出 / 报错日志）才判定启动失败，让用户手动检查
   3. 启动成功后继续执行后续步骤，并在 review 结束时显式告知用户后台进程 PID 和端口，提示 "用完请自行 kill <PID>"——MUST NOT 自动 kill

   选"我手动起"：等用户告知启动完成后继续；用户可以新会话执行 \`/marchen:review\` 重跑。

   选"跳过 UI"：所有场景 ⏭ "dev server 未启动"，跳过后续步骤。

   ### e. 乐观执行场景

   对每个待验证场景：

   1. 用 chrome-devtools MCP 的导航工具打开对应路径
   2. 用快照工具观察页面状态
   3. 把场景的 GIVEN/WHEN/THEN 翻译成具体交互（点击、填写、读取文本）并执行
   4. 比对页面状态与场景预期

   遇到阻塞（登录墙、权限不足、缺数据、表单需要真实输入等）：**主会话可以就地 AskUserQuestion**——例如"需要登录账号才能继续，提供测试账号？/ 跳过这个场景 / 暂停 review"，而不必积攒到最后。

   仍无法继续的场景 → 记录 ⏭ + 阻塞原因，跳到下一个。
   场景翻译不出具体操作（例如纯后端行为描述）→ ⏭ "不适合 UI 验证"。

   ### f. UI 报告格式

   \`\`\`
   ## UI 验证（chrome-devtools MCP）

   测试目标：<URL 或 "未确定">

   ✅ <场景标题> — 通过
        说明：<可选简述>
   ❌ <场景标题> — 失败
        证据：<console error 摘要 / 页面文案 / 关键截图路径>
   ⏭ <场景标题> — 跳过：<阻塞原因>
   \`\`\`

7. **展示报告并按结果分支**

   - **全部通过且无 ⏭**：提示 "可以用 \`marchen archive <name>\` 归档。"
   - **有 ❌ 失败**：提示用户修复后可以再次 review。
   - **有 ⏭ 跳过**：用 **AskUserQuestion** 让用户选择：
     - **补信息后继续**：收集所需信息（账号、数据等），就地再跑被跳过的场景
     - **跳过这些场景，继续归档**：保留报告，提示 \`marchen archive <name>\`
     - **暂停去修复**：什么都不做

   如本次 review 启动了后台 dev server，再次提醒用户进程信息（PID/端口）。

**护栏**

- 不要修改任何代码，只报告（review 不是 apply）
- UI 验证阻塞即停，不要硬闯（不登录、不猜数据、不绕权限）；要继续就向用户索取信息
- 起 dev server 必须先获得用户授权（AskUserQuestion）；起完不自动 kill，告知 PID 让用户自行管理
- 用户提供的凭据/账号等敏感数据：不写入任何 artifact，不在报告里复述明文，截图前对密码/token/邮箱等敏感字段脱敏或回避
- 大 diff 先看 \`git diff --stat\`，按需读单个文件，避免灌爆 context
- 使用 AskUserQuestion 时，选项不超过 4 个
`

export const SKILL_UPDATE = `---
name: marchen-update
description: 修订变更的已有规划产物并双向调和保持一致。适用于用户想修改变更的计划(proposal/specs/design/tasks)、把新决策合入计划、或在编辑后让各产物重新对齐。只改规划产物,绝不修改实现代码。
---

修订变更的已有规划产物,并保持彼此一致。绝不修改代码。

---

**输入**:用户的请求应包含变更名称,或可从上下文推断;通常还带着修改诉求(如"design 改用 X")。

**流程**

1. **选择变更**

   有名称就用,没有则:
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择,并明示"使用变更: \`<name>\`"
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion** 让用户选,选项展示名称、schema、任务进度、创建时间(\`createdAt\`),最近创建的标记"(推荐)"
   - open 变更较多、创建时间不足以判断时,可用 \`ls -dt marchen/changes/*/\` 按最近改动排序辅助推荐(该命令不可用时忽略,退回 createdAt)

   **重要**:多个候选时绝不猜测或自动选定,始终让用户决定。

2. **获取产物清单**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   返回 JSON 包含:
   - \`schema\`:该变更使用的工作流 schema
   - \`artifacts[]\`:各产物的 \`id\`、\`status\`(filled / empty / missing / no-content)和 \`path\`(相对变更目录)
   - specs 类型的产物额外带 \`capabilities[]\`,实际文件为 \`specs/<capability>/spec.md\`
   - \`workflow\` 与 \`tasks\`:依赖状态与任务进度

   产物的 id 和路径来自当前 schema——**不要假设产物名字,不要基于硬编码的产物名做分支判断**。自定义 schema 必须原样可用。

   可编辑对象是 \`status\` 为 \`filled\` 的产物文件,真实路径为 \`marchen/changes/<name>/<path>\`(specs 按 capabilities 展开到各 spec.md)。

3. **理解诉求**

   - 用户提出了具体修改("design 现在改用 X")→ 以此作为起点编辑。
   - 只说"update"/"让它自洽" → 当作一致性审查:通读已有产物,互相对照,找出矛盾、缺口和重复。

4. **读取并调和**

   - 读取诉求涉及的产物,以及该变更其余 filled 产物。
   - 先落实用户要求的修改,然后逐个检查其他产物与它是否一致——**任意方向**:改后置产物可能需要回改前置产物,不是只有顺流而下。构建顺序是好用的阅读顺序,不是修订方向的约束。
   - 记录所有因此不一致、缺失或矛盾的地方。
   - 只修订已存在的文件。**不要创建**尚不存在的产物,也不要在 specs 下新建 capability 目录——记录下来,第 6 步告知用户。
   - 变更本来就自洽时,直接说明,不做任何修改。

5. **逐个产物确认后写入**

   - 展示每处拟修订的内容和理由,用户确认后才写入。
   - 用户拒绝的修订不写,该产物保持原样。
   - 需要大幅重写时,先获取该产物的格式规则和模板:

     \`\`\`bash
     marchen instructions <name> <artifact-id> --json
     \`\`\`

6. **指出下一步(仅建议,绝不代为执行)**

   - 还有 empty / missing 的产物 → 告知用户,建议按 \`marchen instructions\` 的指引补全。
   - 变更已实现过(tasks 已勾选)→ 代码可能已和修订后的计划不符,建议 \`/marchen:apply\` 把差异带进代码。
   - 全部完成且已实现 → 建议 \`/marchen:archive\`。

**输出**

每次调用结束时展示:
- 修订了哪些产物(以及哪些拟修订被用户拒绝)
- 哪些缺失产物被记录但未创建
- 变更当前所处状态,和推荐的下一条命令

**护栏**

- 只改规划产物——**绝不修改实现代码**(update 不是 apply)。修订后的计划意味着要改代码时,停下来,指向 \`/marchen:apply\`。
- 使用 \`marchen status\` 报告的产物 id 和路径;绝不基于硬编码产物名分支。
- 只编辑已存在的文件;不推进构建前沿:不创建新产物、不在 specs 下新建 capability——补全是 propose/instructions 的职责。
- 每处修改写入前必须经用户确认;update 是专门的修订动作,不是 explore 式的顺手捕获。
- 如果诉求改变的是变更的**意图**而非细化,建议用 \`/marchen:propose\` 重开一个新变更("修订 vs 重开"启发式)。
`

/** Skill 模板定义 */
export interface SkillTemplate {
  readonly dirName: string
  readonly content: string
}

/** 所有 skill 模板 */
export const SKILL_TEMPLATES: Record<string, SkillTemplate> = {
  apply: { dirName: 'marchen-apply', content: SKILL_APPLY },
  archive: { dirName: 'marchen-archive', content: SKILL_ARCHIVE },
  explore: { dirName: 'marchen-explore', content: SKILL_EXPLORE },
  lite: { dirName: 'marchen-lite', content: SKILL_LITE },
  'propose-preview': {
    dirName: 'marchen-propose-preview',
    content: SKILL_PROPOSE_PREVIEW,
  },
  propose: { dirName: 'marchen-propose', content: SKILL_PROPOSE },
  review: { dirName: 'marchen-review', content: SKILL_REVIEW },
  update: { dirName: 'marchen-update', content: SKILL_UPDATE },
}
