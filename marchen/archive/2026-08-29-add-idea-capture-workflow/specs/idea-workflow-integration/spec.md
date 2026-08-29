## 目的

让 AI Skill 能把尚未准备实施的讨论保存为 idea、在后续探索中恢复相关上下文，并在进入正式流程时可靠地完成晋升。

### 需求: 捕获探索状态而非聊天原文

`marchen-capture` SHALL 将当前讨论提炼为可继续探索的状态快照，不得默认保存完整聊天记录。

#### 场景: 捕获新 idea

- **GIVEN** 当前讨论尚未进入正式 change
- **WHEN** 用户调用 capture
- **THEN** Skill 生成包含一句话摘要、背景、已确认事项、当前倾向、待确认问题、已否决方案、相关文件或历史以及下一继续点的 Markdown
- **AND** 通过 CLI 创建新的 idea
- **AND** 告知用户 idea 名称以及继续探索和晋升的命令

#### 场景: 更新同一 idea

- **GIVEN** 当前讨论与一个已有 idea 明确属于同一主题
- **WHEN** 用户再次调用 capture
- **THEN** Skill 先读取完整 idea 和修订值
- **AND** 将新旧内容调和为一份完整快照后执行受修订保护的更新
- **AND** 不把增量内容简单堆叠成聊天日志

#### 场景: 同名但不同主题

- **GIVEN** 建议名称已被不相关 idea 使用
- **WHEN** Skill 准备捕获当前讨论
- **THEN** Skill 选择新的明确名称或向用户确认
- **AND** 不覆盖原 idea

### 需求: 捕获前的信息清理

Capture Skill MUST 在内容送入 CLI 前移除凭据、Cookie、令牌、账号数据和绝对本机路径等明显敏感信息；CLI 不得声称能识别所有业务机密。

#### 场景: 对话包含本机绝对路径

- **GIVEN** 对话引用用户主目录下的绝对路径
- **WHEN** Skill 生成 idea 内容
- **THEN** 保存内容使用项目相对路径或不识别个人的占位描述

#### 场景: 对话包含凭据

- **GIVEN** 对话中出现 Cookie、访问令牌或私钥内容
- **WHEN** Skill 捕获 idea
- **THEN** 凭据本身不会出现在保存的 Markdown 中
- **AND** Skill 仅保留对后续探索必要的非敏感事实

### 需求: 显式恢复 idea

Explore Skill SHALL 支持通过 `idea:<name>` 精确加载已有 idea，并将其作为后续讨论的背景。

#### 场景: 精确名称存在

- **WHEN** 用户调用 explore 并传入 `idea:<name>`
- **THEN** Skill 使用 CLI 读取该 idea 的完整内容
- **AND** 明确告知用户已加载的 idea 名称

#### 场景: 精确名称不存在

- **WHEN** 用户指定不存在的 idea 名称
- **THEN** Skill 报告未找到
- **AND** 可展示名称相近的轻量候选，但不得自动改用另一个 idea

### 需求: 基于语义恢复相关 idea

Explore Skill SHALL 使用 CLI 返回的名称、标题、摘要、标签和更新时间，由当前 AI 对自然语言输入进行语义判断；不得依赖 QMD、embedding 或固定数值分数。

#### 场景: 唯一明确匹配

- **GIVEN** 当前描述与一个 idea 明确对应
- **WHEN** Skill 检查轻量 idea 列表
- **THEN** Skill 自动读取该 idea 的完整内容
- **AND** 在继续讨论前告知用户自动匹配到了哪个 idea

#### 场景: 存在多个合理候选

- **GIVEN** 当前描述可能对应多个 idea
- **WHEN** Skill 无法可靠区分
- **THEN** Skill 展示候选的名称和摘要供用户选择
- **AND** 在用户选择前不加载任一完整正文

#### 场景: 没有匹配项

- **WHEN** 当前描述与已有 idea 均无明显关联
- **THEN** Skill 将其作为新主题继续探索
- **AND** 不为了复用而强行关联旧 idea

#### 场景: 空输入开始探索

- **WHEN** 用户未提供主题直接进入 explore
- **THEN** Skill 展示最近更新的 idea 和“开始新主题”入口
- **AND** 不自行猜测用户想继续哪个 idea

### 需求: 自然的探索出口

Explore Skill SHOULD 在讨论达到自然停顿点时，根据成熟度提供 capture、lite 和 propose 三种明确出口，同时允许用户继续讨论。

#### 场景: 尚未准备实施

- **GIVEN** 讨论形成了有价值的背景但仍有关键问题未决
- **WHEN** 探索达到自然停顿点
- **THEN** Skill 推荐 `/marchen:capture`
- **AND** 不自动保存或创建正式变更

#### 场景: 已适合进入实现规划

- **GIVEN** 想法范围和目标已经明确
- **WHEN** 探索达到自然停顿点
- **THEN** Skill 根据复杂度推荐 `/marchen:lite` 或 `/marchen:propose`
- **AND** 只输出建议命令，不直接启动另一个 Skill

### 需求: 从 idea 创建正式变更

Propose 与 Lite Skill SHALL 支持显式的 `idea:<name>` 输入；它们不得通过模糊语义匹配静默消费 idea。

#### 场景: Propose 使用一个或多个 idea

- **GIVEN** 用户显式指定已有 idea
- **WHEN** Propose 创建完整变更
- **THEN** proposal、specs、design 和 tasks 使用这些 idea 作为探索背景
- **AND** 所有规划产物验证就绪后，Skill 调用 CLI 将源 idea 一次性晋升到 change

#### 场景: Lite 使用 idea

- **GIVEN** 用户显式指定已有 idea
- **WHEN** Lite 创建轻量变更
- **THEN** Skill 使用 idea 生成并验证 tasks
- **AND** 在开始实现前调用 CLI 晋升源 idea

#### 场景: 正式产物创建失败

- **GIVEN** 正在从 idea 创建 change
- **WHEN** 任一必要规划产物生成或验证失败
- **THEN** Skill 不调用晋升命令
- **AND** 原 idea 继续保留在 `marchen/ideas/`

### 需求: 正式产物保持真相源

晋升后的 exploration 文件 SHALL 被视为形成决策前的背景记录；正式 change 的 proposal、specs、design 和 tasks MUST 是实施与更新流程的依据。

#### 场景: 晋升后继续修改设计

- **GIVEN** idea 已进入 change 的 `exploration/` 目录
- **WHEN** 后续讨论改变需求、设计或任务
- **THEN** Skill 建议修改对应正式 artifact
- **AND** 不要求同步重写 exploration 文件

#### 场景: 在已有 change 中探索旁支

- **GIVEN** 用户正在探索一个 open change
- **WHEN** 新洞察直接影响该 change
- **THEN** Explore 建议更新对应正式 artifact
- **AND** 只有用户明确要暂存独立旁支时才创建新的 idea
