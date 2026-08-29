// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改

export const SKILL_ACCEPTANCE = `---
name: marchen-acceptance
description: 把变更做成带证据的本地验收页，等人签核。只在 apply/lite 收尾或用户显式调用时执行。
disable-model-invocation: true
argument-hint: <change-name>
---

出示本地验收页：取证写入 \`acceptance/rounds/<n>/\`，灌 HTML，起本机签字服务。禁止代人点接受、打回修改或「让 AI 修改」。

---

**输入**：变更名称，或从上下文推断。

**流程**

1. **选择变更**

   有名称就用，没有则：
   - 从对话上下文推断
   - 只有一个 open 变更时自动选择
   - 多个变更时 \`marchen list --json\` + **AskUserQuestion**

   显示："Acceptance 变更: \`<name>\`"

2. **预检**

   \`\`\`bash
   marchen status <name> --json
   marchen acceptance status <name> --json
   \`\`\`

   - 任务未勾完：AskUserQuestion 继续 / 停止
   - \`git diff --stat HEAD\`（空则 \`HEAD~1\`）没有产品向改动：说明无可出示的结果，停止。不要为此编造清单项
   - \`acceptance status\` 里 \`decision.status\` 已是 \`accepted\`：提示可以 \`/marchen:archive\`，**不要**开新轮
   - 已是 \`rejected\`：准备开下一轮。先把当前 \`decision.json\` 抄到本轮 \`human-decision.json\`，再把根上决定重置为 \`{ "status": "pending", "items": [] }\`。不要改已有 \`rounds/<n>/\` 里的证据

   单测、lint、tsc、CI、以及「某个 task 有对应 diff」**不准**写进验收清单。设计偏离写进该轮 \`report.md\`。

3. **写这一轮**

   目录：

   \`\`\`
   marchen/changes/<name>/acceptance/
     requirement.md      # 第一轮写一句目标，之后不准改
     decision.json       # 没有则写成 { "status": "pending", "items": [] }
     decision-assets/    # 人插入的附图
     rounds/<n>/
       result.json
       report.md
       assets/
   \`\`\`

   \`<n>\` 是已有最大轮次 + 1；没有则 \`1\`。

   \`requirement.md\` 只在不存在时写一句人能判断的目标。

   \`result.json\` 字段：\`title\`、\`plan\`、\`cases\`、\`summary\`、\`commit\`、\`surfaces\`。
   每条 plan/case 必须是人看得见、听得见或拿得到的结果。
   写第二轮及后续轮次前必须读取上一轮 \`result.json\`，并遵守案例 id 稳定规则：
   - 同一个验收目标复用原 id；文案调整或排序变化不得生成新 id
   - 新增验收目标才生成新 id
   - 已移除目标的 id 只留在历史轮次，不得拿给别的新目标复用
   同一轮的 \`plan[].id\` 与 \`cases[].id\` 必须一一对应且不得重复。
   证据路径相对本轮，如 \`assets/foo.png\`。只截图，不录像，不要安装 \`agent-browser\`。
   有浏览器自动化就截图放进 \`assets/\`；没有就把对应项标 \`blocked\`，在 \`report.md\` 说明。不要假装截过图。

4. **灌页并打开**

   \`\`\`bash
   marchen acceptance render <name> --json
   marchen acceptance serve <name> --json
   \`\`\`

   serve 默认前台。在本会话用后台方式启动，记下 URL。
   **禁止**用浏览器自动化点击「接受交付」、「打回修改」或「让 AI 修改」，**禁止**代发 \`POST /decision\`。

5. **等人**

   轮询：

   \`\`\`bash
   marchen acceptance status <name> --json
   \`\`\`

   直到 \`decision.status\` 不是 \`pending\`，或用户在对话里打断。

   - \`accepted\` → 询问是否归档；未经确认不得 \`marchen archive\`
   - \`rejected\` → 不归档。按 \`decision.items\` 的 comment 与 \`images\` 附图修改，修完从步骤 2 开新轮（先抄 \`human-decision.json\` 并重置 pending）
   - 用户说先挂着 → 留下 URL，结束

**护栏**

- \`disable-model-invocation\`：未显式调用、也不是 apply/lite 收尾时，不要自己开跑
- 不要改已经存在的 \`rounds/<n>/\`
- 不要点验收页上的写入按钮，不要装 agent-browser
- 使用 AskUserQuestion 时选项不超过 4 个
`

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
   - \`"all_done"\` → 先 \`marchen acceptance status <name> --json\`：已 accepted 则提示归档且不要开新轮；rejected 则按待修改项修改后开新一轮 acceptance；尚无验收则走第 5 步的验收收尾
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

   全部完成时（任务从「未全部完成」变为「全部完成」的这一次）：
   MUST 接着执行 \`marchen-acceptance\` 的流程（预检、写 \`rounds/1\`、\`render\`、\`serve\`、轮询决定）。不要只打印一句提示就结束。
   禁止代人点验收页上的接受、打回修改或「让 AI 修改」。

   人接受后询问是否归档；提交待修改则按 \`decision.items\` 继续改，修完开新轮。

   暂停时：
   "暂停于任务 N/M: <原因>"

**护栏**

- 实现前必须读 context 中的 artifact 内容
- 每完成一个任务立即勾选 checkbox，不要攒着
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- 如果实现过程中遇到不确定的设计决策，先扫描 \`marchen/changelog.md\`，再读取相关 archive 中的 proposal、design 或 spec
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
   marchen acceptance status <name> --json
   \`\`\`

   解析 JSON，检查：
   - \`artifacts\`：每个 artifact 的 \`status\` 是否为 \`filled\`
   - \`tasks.completed\` vs \`tasks.total\`（\`tasks\` 为 null 时视为无任务，跳过检查）
   - 验收：\`acceptance exists\` 为 false，或 \`decision\` 不是 accepted → 警告「尚未签核」

   **如果本次来自 lite「直接归档」：** 不要再问尚未验收，继续。

   **如果全部完成且已 accepted（或 lite 已声明跳过）：** 直接进入下一步。先 \`marchen acceptance stop <name>\`。

   **如果有未完成的 artifact、task，或尚未签核：**
   - 显示警告，列出未完成项
   - 用 **AskUserQuestion** 确认是否继续
   - 用户确认后继续，不阻塞
   - 归档前尽量 \`marchen acceptance stop <name>\`

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

export const SKILL_CAPTURE = `---
name: marchen-capture
description: 把尚未准备实施的当前讨论提炼为可恢复的 Idea。适用于用户想先保存探索状态、以后再继续或晋升。
---

把当前讨论保存为 \`marchen/ideas/<name>.md\`，供后续 explore、lite 或 propose 使用。

**Capture 保存的是探索状态快照，不是聊天记录。** 只保留后续继续判断所需的背景、结论和问题，不逐句复制对话。

---

## 1. 判断是否适合 Capture

- 尚未创建正式 change：可以创建或更新 Idea。
- 正在讨论 open change，且洞察直接影响其范围、需求、设计或任务：优先建议 \`/marchen:update <change>\`，不要另建重复 Idea。
- 正在讨论 open change，但用户明确要把独立旁支暂存到以后：可以 Capture 为新 Idea。

## 2. 检查已有 Idea

\`\`\`bash
marchen idea list --json
\`\`\`

根据名称、标题、摘要和标签判断当前主题是否与已有 Idea 相同：

- 唯一明确属于同一主题：读取完整内容与 revision。
  \`\`\`bash
  marchen idea show <name> --json
  \`\`\`
- 多个可能相同：让用户选择，不要猜。
- 建议名称已存在但主题不同：改用更明确的 kebab-case 名称，必要时询问用户。
- 没有匹配：创建新 Idea。

## 3. 生成状态快照

生成带 frontmatter 的完整 Markdown。不要填写 \`format\`、\`createdAt\`、\`updatedAt\`，这些字段由 CLI 管理。

\`\`\`md
---
title: 面向人的标题
summary: 一句话说明这个想法及当前关注点
tags:
  - tag-a
  - tag-b
---

> 本文记录尚未定案的探索背景；晋升后以正式变更产物为准。

## 背景与价值

为什么讨论它，想解决什么。

## 已确认

- 已经明确且仍然有效的事实或决策。

## 当前倾向

- 尚未成为正式决策，但目前偏向的方案及原因。

## 待确认

- 下次继续时需要回答的问题。

## 已否决

- 不再考虑的方案及原因，避免重复讨论。

## 相关上下文

- 使用项目相对路径记录相关文件、change 或 archive；没有则写“无”。

## 下次从这里继续

一句可直接交给 Explore 的继续提示。
\`\`\`

内容应调和为当前完整状态，不要把新内容追加成时间线或聊天日志。没有内容的推荐章节可以写“无”，不要编造。

## 4. 隐私检查

写入前必须检查并清理：

- Secret、Token、Cookie、私钥、签名 URL
- 账号、地址、订单号等个人数据
- \`/Users/<name>/...\`、\`C:\\Users\\<name>\\...\` 等绝对本机路径，改成项目相对路径或非识别性描述
- 与继续探索无关的内部数据

CLI 不能判断任意自然语言是否属于组织机密。Idea 默认是 Git 可追踪的项目文件，提醒用户提交前 review；不要执行 \`git add\`、commit 或 push。

## 5. 通过 CLI 保存

优先使用执行工具原生的 stdin 能力。只能使用 shell 重定向时，使用不展开变量的带引号 heredoc，并选择不会出现在正文中的唯一结束标记。

创建：

\`\`\`bash
marchen idea create <name> --stdin --json <<'MARCHEN_IDEA_EOF'
<完整 Markdown>
MARCHEN_IDEA_EOF
\`\`\`

更新已有 Idea：先保留 \`show --json\` 返回的 revision，调和旧内容与当前讨论后提交完整新文档。

\`\`\`bash
marchen idea update <name> --if-revision '<revision>' --stdin --json <<'MARCHEN_IDEA_EOF'
<完整 Markdown>
MARCHEN_IDEA_EOF
\`\`\`

revision 冲突时，不要强制覆盖。重新 show，调和最新内容后再更新；存在实质冲突则请用户决定。

写入成功后执行：

\`\`\`bash
marchen idea show <name> --json
\`\`\`

确认名称、标题、摘要、正文和新 revision 均可读取。

## 输出

说明创建或更新了哪个 Idea，并给出后续入口：

\`\`\`text
/marchen:explore idea:<name>
/marchen:lite idea:<name>
/marchen:propose idea:<name>
\`\`\`

不要自动启动下一阶段。

## 护栏

- 不保存完整聊天原文
- 不把未确认倾向写成正式决策
- 不覆盖同名但不同主题的 Idea
- 更新必须携带刚读取到的 revision
- 写入失败或验证失败时，不声称已经 Capture
- 不自动执行 Git 操作
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
- Idea：\`idea:add-dark-mode\`（精确恢复之前保存的探索）
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

3. 尚未晋升的 Idea：

\`\`\`bash
marchen idea list --json
\`\`\`

只使用返回的名称、标题、摘要、标签和更新时间判断相关性，不要读取所有完整正文或使用数值评分。

- 输入包含 \`idea:<name>\`：直接执行 \`marchen idea show <name> --json\`。不存在就明确报告，可展示名称相近候选，但不得改用另一个 Idea。
- 自然语言与一个 Idea 唯一明确匹配：自动 show，并在继续前告诉用户“已加载 Idea: \`<name>\`”。
- 多个 Idea 都合理：展示名称和摘要让用户选择，选择前不读取完整正文。
- 没有明显匹配：当作新主题，不强行关联。
- 没有输入：展示最近更新的 Idea 和“开始新主题”，不要替用户猜。
- \`issues\` 中的损坏文件只提示，不应阻止其他 Idea 的使用。

这告诉你：
- 是否有进行中的变更
- 它们的名称、schema 和状态
- 项目过去做过哪些变更
- 是否有值得恢复的未晋升 Idea
- 用户可能在做什么

如果用户提到了特定变更名称，读取它的 artifact 作为上下文。

### 没有变更时

自由思考。当洞察结晶时，根据复杂度推荐下一步：

**判断标准：**
- \`/marchen:capture\` — 讨论有价值但仍有关键问题未决，先保存以后继续
- \`/marchen:lite\` — bug 修复、小改动、单一任务组、不需要设计文档
- \`/marchen:propose\` — 新功能、多步骤、需要 design/specs、涉及多模块

**推荐方式：** 直接在回复中输出推荐，说明理由，让用户自行输入命令。示例：

> 这个方向值得保留，但还有关键问题未定，建议用 \`/marchen:capture\` 暂存。
>
> 如果范围已经明确，则根据复杂度选择 \`/marchen:lite\` 或 \`/marchen:propose\`。

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

如果出现与当前 change 无关的独立旁支，只有用户明确表示要暂存时才建议 \`/marchen:capture\`；不要把当前 change 的决策复制成 Idea。

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

- **暂存以后继续**：建议用户显式调用 \`/marchen:capture\`，不要自动保存
- **流向下一阶段**：按成熟度和复杂度推荐 \`/marchen:lite\` 或 \`/marchen:propose\`
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
- **不自动启动下一 Skill** — 输出建议命令，让用户决定
- **只用轻量元数据匹配 Idea** — 读取 CLI 返回的摘要信息并由当前 AI 判断
- **要可视化** — 一张好图胜过千言万语
- **要探索代码库** — 让讨论扎根于现实
- **要质疑假设** — 包括用户的和你自己的
`

export const SKILL_LITE = `---
name: marchen-lite
description: 一键式轻量变更流程。创建 lite 变更、实现任务、询问验收或归档，一气呵成。适合 bug 修复、小改动。
---

一键式轻量变更 — 使用 lite schema 创建变更，自动实现任务，完成后询问验收或归档。
适合 bug 修复、小改动、explore 之后的快速执行。

---

**输入**：用户的请求应包含变更名称（kebab-case）、变更描述，或一个/多个显式 \`idea:<name>\`。

如果包含 \`idea:<name>\`，创建变更前逐个执行：

\`\`\`bash
marchen idea show <name> --json
\`\`\`

把完整 Idea 作为 tasks 的探索背景。只使用用户显式指定的 Idea，不通过模糊语义匹配自动消费其他 Idea。任一指定 Idea 不存在或损坏时先停止。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述、Idea 标题与摘要中提取 kebab-case 名称（如"修复登录 bug" → \`fix-login-bug\`）。\`idea:<name>\` 是来源标识，不强制作为 change 名称。

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

   根据用户描述 + 显式 Idea 背景 + \`instruction\` 指引 + \`template\` 结构，填充 tasks.md：
   - \`## 背景\`：简要说明变更目的和方案
   - 任务列表：按组分类，checkbox 格式

   写入 \`marchen/changes/<name>/tasks.md\`。

   如果用户描述太模糊，用 **AskUserQuestion** 澄清关键信息。

5. **验证 tasks 并晋升显式 Idea**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   确认 \`workflow.next\` 为 \`null\` 且 tasks 为 \`filled\`。如果使用了显式 Idea，在开始实现前一次性执行：

   \`\`\`bash
   marchen idea promote <idea-name> [<idea-name>...] --change <name> --json
   \`\`\`

   tasks 创建或验证失败时不得 promote，源 Idea 继续留在 \`marchen/ideas/\`。promote 失败时停止流程，不要开始实现。

6. **开始实现**

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

7. **全部完成 → 一道题**

   所有任务完成后，用 **AskUserQuestion** 只问一次：

   > "全部任务已完成 (N/N)，下一步？"
   > - 验收再归档
   > - 直接归档
   > - 只验收
   > - 先不动

   **验收再归档：** 执行 \`marchen-acceptance\` 全文。等到 \`decision.status\` 为 accepted 再归档；若人点了「让 AI 修改」（\`rejected\`）则不归档，按待修改项修并开新轮。归档前 \`marchen acceptance stop\`。

   **直接归档：** 不要创建 \`acceptance/\`。读取 tasks.md 背景段生成一句话摘要，执行 \`marchen archive <name> --summary "<摘要>" --json\`。不要再问「尚未验收」。

   **只验收：** 执行 acceptance，不要 archive。

   **先不动：** 显示后续可用 \`/marchen:acceptance <name>\` 或 \`/marchen:archive <name>\`。

**护栏**

- 必须使用 \`--schema lite\` 创建变更
- tasks.md 的 \`## 背景\` 章节必须填写，不能留空
- 任务粒度要小到一个会话内能完成
- 如果上下文关键信息不清楚，询问用户；但小疑问优先做合理判断，保持节奏
- 已存在同名变更时必须询问用户，不要覆盖
- 只读取和晋升用户显式指定的 \`idea:<name>\`，不得隐式消费语义候选
- 必须在 tasks 验证后、实现前晋升 Idea；探索文件不替代 tasks
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
- 中文为主，技术名词保留英文（如 \`IdeaManager\`、\`SDK\`）
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

**输入**：用户的请求应包含变更名称（kebab-case）、变更描述，或一个/多个显式 \`idea:<name>\`。

如果包含 \`idea:<name>\`，在创建变更前逐个读取：

\`\`\`bash
marchen idea show <name> --json
\`\`\`

把完整 Idea 作为所有 artifact 的探索背景。只消费用户显式指定的 Idea；不要通过模糊语义匹配静默带入其他 Idea。任一指定 Idea 不存在或损坏时先停止处理。

**流程**

1. **确定变更名称**

   如果提供了输入，直接使用或从描述、Idea 标题与摘要中提取 kebab-case 名称（如"添加用户认证" → \`add-user-auth\`）。\`idea:<name>\` 是来源标识，不强制作为 change 名称。

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
      - 如果指定了 Idea，同时读取其完整内容作为形成正式决策前的背景；区分其中的已确认事项、倾向和待确认问题
      - 按 \`instruction\` 指引 + \`template\` 结构生成内容
      - 写入 \`marchen/changes/<name>/<outputPath>\`
      - 写入后验证文件存在

      **specs（目录型 artifact，outputPath 为 \`specs/\`）：**
      - 读取 proposal 内容（在 \`context\` 中，\`id\` 为 \`proposal\` 的 \`content\`）
      - 结合显式 Idea 背景，但以 proposal 中已经确定的能力范围为准
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

4. **验证并晋升显式 Idea**

   \`\`\`bash
   marchen status <name> --json
   \`\`\`

   只有 \`workflow.next\` 为 \`null\`，且 proposal、specs、design、tasks 全部为 \`filled\` 时，才一次性晋升所有显式 Idea：

   \`\`\`bash
   marchen idea promote <idea-name> [<idea-name>...] --change <name> --json
   \`\`\`

   未使用 Idea 时跳过。任一 artifact 创建或验证失败时不得 promote，原 Idea 留在 \`marchen/ideas/\`。promote 失败时报告实际错误并停止，不要声称提案已经完整衔接。

5. **显示最终状态**

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
- 只读取和晋升用户显式指定的 \`idea:<name>\`，不得隐式消费语义候选
- 必须先完成并验证全部 artifact，再晋升 Idea；探索文件不替代正式 artifact
- \`instruction\` 是给你的指引，不要把它原样复制到 artifact 文件中
- 使用 AskUserQuestion 时，选项不超过 4 个；需要更多选项时合并或分步询问
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
  acceptance: { dirName: 'marchen-acceptance', content: SKILL_ACCEPTANCE },
  apply: { dirName: 'marchen-apply', content: SKILL_APPLY },
  archive: { dirName: 'marchen-archive', content: SKILL_ARCHIVE },
  capture: { dirName: 'marchen-capture', content: SKILL_CAPTURE },
  explore: { dirName: 'marchen-explore', content: SKILL_EXPLORE },
  lite: { dirName: 'marchen-lite', content: SKILL_LITE },
  'propose-preview': {
    dirName: 'marchen-propose-preview',
    content: SKILL_PROPOSE_PREVIEW,
  },
  propose: { dirName: 'marchen-propose', content: SKILL_PROPOSE },
  update: { dirName: 'marchen-update', content: SKILL_UPDATE },
}
