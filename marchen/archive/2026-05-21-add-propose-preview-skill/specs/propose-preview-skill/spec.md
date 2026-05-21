## 目的

提供 `marchen-propose-preview` skill：用户显式调用后，从已生成的变更 artifact 中提取关键信息，输出一张终端可读的浓缩卡片，帮助人快速 review。

### 需求: 显式调用语义

系统 MUST 通过 SKILL.md frontmatter 阻止 AI 自动触发该 skill，仅在用户显式输入 `/marchen:propose-preview` 时执行。

#### 场景: 用户显式调用

- **GIVEN** 存在一个 status 为 ready 或 all_done 的变更
- **WHEN** 用户输入 `/marchen:propose-preview <name>`
- **THEN** skill 被加载并执行
- **AND** 卡片输出到终端

#### 场景: 上下文相关但未显式调用

- **GIVEN** 用户在对话中刚刚完成 `/marchen:propose`
- **WHEN** AI 判断"用户可能想看摘要"
- **THEN** AI MUST NOT 自动执行 marchen-propose-preview
- **AND** AI 只能在文字中提及该命令供用户自行调用

### 需求: 数据源单一

系统 MUST 通过 `marchen instructions <name> apply --json` 获取所有 artifact 内容作为唯一数据源，不得读取 artifact 文件、不得调用其他 marchen 子命令获取内容。

#### 场景: 调用成功

- **GIVEN** 变更存在且 artifact 已生成
- **WHEN** skill 执行
- **THEN** 系统调用 `marchen instructions <name> apply --json` 一次
- **AND** 从返回的 `context` 数组读取所有 artifact 内容

#### 场景: 变更不存在

- **GIVEN** 用户传入的变更名不存在
- **WHEN** skill 执行 `marchen instructions` 命令
- **THEN** CLI 返回非零退出码与错误信息
- **AND** skill 将错误透传给用户，不强行生成卡片

### 需求: 按 schema 切换卡片模板

系统 MUST 根据返回 JSON 的 `schemaName` 字段（`full` 或 `lite`）选择不同的摘要结构。

#### 场景: full schema 输出

- **GIVEN** 变更 schemaName 为 `full`
- **WHEN** 生成卡片
- **THEN** 卡片包含四段："改了什么"、"关键决策"、"影响范围"、"风险"
- **AND** 各段分别从 proposal、design 提取信息

#### 场景: lite schema 输出

- **GIVEN** 变更 schemaName 为 `lite`
- **WHEN** 生成卡片
- **THEN** 卡片包含两段："改了什么"、"任务概览"
- **AND** 任务概览按 tasks.md 一级标题聚合显示完成进度

### 需求: 阻塞状态拒绝生成

系统 MUST 在变更 state 为 `blocked` 时拒绝生成卡片，避免输出半成品摘要误导用户。

#### 场景: 变更未填完

- **GIVEN** 变更存在但 tasks.md 缺失或为空
- **WHEN** skill 执行获取到 `state: "blocked"`
- **THEN** skill 打印提示信息引导用户先用 `/marchen:propose` 补齐 artifact
- **AND** skill 不输出卡片

### 需求: 摘要规则硬约束

系统 MUST 在 SKILL.md 中显式列出摘要规则的硬上限，并要求 AI 严格遵守。

#### 场景: 卡片格式约束

- **GIVEN** AI 正在生成卡片
- **WHEN** 内容行被填充
- **THEN** 卡片框宽固定 70 字符（含边框）
- **AND** 每行内容（去边框后）不超过 60 字符
- **AND** 超长内容必须截断、合并或重写，不允许折行

#### 场景: 段落条数上限

- **GIVEN** AI 正在生成 full schema 卡片
- **WHEN** 填充各段内容
- **THEN** "改了什么"段不超过 6 条 bullet
- **AND** "关键决策"段不超过 5 条 bullet
- **AND** "影响范围"段的 ASCII 图节点不超过 8 个
- **AND** "风险"段不超过 3 条 bullet

#### 场景: 影响范围图退化

- **GIVEN** 影响范围信息超出图能容纳的复杂度
- **WHEN** AI 生成"影响范围"段
- **THEN** AI MUST 改用 bullet 列表列出模块名
- **AND** AI MUST NOT 强行画歪斜或截断的 ASCII 图

### 需求: 禁止粘贴原文

系统 MUST 要求 AI 重新组织 artifact 内容生成摘要，禁止直接粘贴 proposal、design、spec 的原文段落。

#### 场景: 摘要生成

- **GIVEN** AI 从 context 读取到 proposal 的"动机"段（多行散文）
- **WHEN** AI 填充卡片的"一句话动机"
- **THEN** AI 必须重新提炼为一句话（≤55 字）
- **AND** AI 不得复制原段落

### 需求: 纯终端输出

系统 MUST 仅向标准输出打印卡片，不写任何文件、不在卡片外添加解释段落。

#### 场景: 卡片打印

- **GIVEN** AI 完成卡片内容生成
- **WHEN** 输出阶段
- **THEN** AI 输出单个卡片 + 一行下一步提示
- **AND** AI 不创建、修改任何文件
- **AND** AI 不在卡片前后添加额外说明文字
