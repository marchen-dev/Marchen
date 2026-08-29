## 目的

为尚未进入正式变更流程的想法提供稳定、可检查的文件存储和 CLI 生命周期，使 AI 工具不需要直接拼接路径或自行处理覆盖与迁移。

### 需求: Idea 目录与文件身份

系统 SHALL 将未晋升的 idea 存储为 `marchen/ideas/<name>.md`，其中 `<name>` 必须为 kebab-case，文件名 SHALL 是 idea 的唯一标识。

#### 场景: 初始化新工作区

- **GIVEN** 当前目录尚未初始化 Marchen
- **WHEN** 用户完成 `marchen init`
- **THEN** 工作区包含可被 Git 正常追踪的 `marchen/ideas/` 目录
- **AND** 系统不会把该目录自动加入 `.gitignore`

#### 场景: 拒绝不安全名称

- **WHEN** 用户使用包含路径分隔符、路径回退或非 kebab-case 字符的 idea 名称
- **THEN** 命令以校验错误退出
- **AND** 不在 `marchen/ideas/` 之外读写任何文件

### 需求: 稳定的 Markdown 契约

系统 SHALL 使用带版本号、标题、摘要、标签和时间字段的 Markdown frontmatter 表示 idea；名称从文件名派生，创建和更新时间由 CLI 管理。

#### 场景: 创建有效 idea

- **GIVEN** 同名 idea 不存在
- **WHEN** 调用创建命令并通过标准输入提供有效的 idea 内容
- **THEN** 系统创建对应 Markdown 文件
- **AND** 写入格式版本、创建时间和更新时间
- **AND** 返回可供 Skill 使用的结构化结果

#### 场景: 防止创建时覆盖

- **GIVEN** 同名 idea 已存在
- **WHEN** 再次调用创建命令
- **THEN** 系统拒绝操作并保持原文件不变

### 需求: 轻量列举与完整读取

系统 SHALL 支持以人类可读或 JSON 形式列举 idea 的轻量元数据，并支持按名称读取完整内容与当前修订值。

#### 场景: JSON 列举 idea

- **GIVEN** idea 目录包含多个有效文件
- **WHEN** 调用 `marchen idea list --json`
- **THEN** 结果包含每个 idea 的名称、标题、摘要、标签和更新时间
- **AND** 结果不包含完整正文

#### 场景: 单个损坏文件

- **GIVEN** idea 目录同时包含有效文件和无法解析的 Markdown 文件
- **WHEN** 调用 idea 列举命令
- **THEN** 系统仍返回所有有效 idea
- **AND** 单独报告损坏文件及其错误，不使整个列表失败

#### 场景: 读取完整 idea

- **WHEN** 调用 `marchen idea show <name> --json`
- **THEN** 结果包含完整元数据、正文和基于当前文件内容生成的修订值

### 需求: 带并发保护的更新

系统 MUST 使用调用方提供的预期修订值保护更新，避免较旧的 AI 上下文静默覆盖其他任务或人工产生的新内容。

#### 场景: 修订值匹配

- **GIVEN** 调用方持有当前 idea 的修订值
- **WHEN** 调用更新命令并提交完整新内容
- **THEN** 系统保留原创建时间、刷新更新时间并写入新内容
- **AND** 返回新的修订值

#### 场景: 修订值过期

- **GIVEN** idea 在调用方读取后已被其他操作修改
- **WHEN** 调用方使用旧修订值更新
- **THEN** 系统拒绝更新并保持当前文件不变
- **AND** 提示调用方重新读取和合并

### 需求: 明确删除

系统 SHALL 支持删除未晋升 idea，但 MUST 在交互使用时获得确认，并仅在调用方明确表示已确认时允许非交互删除。

#### 场景: 取消删除

- **GIVEN** idea 已存在
- **WHEN** 用户在确认提示中取消
- **THEN** idea 文件保持不变

#### 场景: 已确认的非交互删除

- **GIVEN** 上层 Skill 已获得用户明确确认
- **WHEN** 调用删除命令并传入确认标志
- **THEN** 系统删除指定 idea
- **AND** 不影响其他 idea 或 change

### 需求: 可靠晋升到正式变更

系统 SHALL 支持把一个或多个 idea 晋升到已存在的 open change，并将文件移动到 `marchen/changes/<change>/exploration/`；只有通过全部预检查后才能改变源文件。

#### 场景: 晋升到 full 变更

- **GIVEN** 目标为 open 的 full change
- **AND** 其 proposal、specs、design 和 tasks 规划产物均已填充
- **WHEN** 调用 idea 晋升命令
- **THEN** idea 被移动到目标 change 的 `exploration/` 目录
- **AND** `marchen/ideas/` 中不再保留源文件

#### 场景: 晋升到 lite 变更

- **GIVEN** 目标为 open 的 lite change
- **AND** 其 tasks 已填充
- **WHEN** 在实现开始前调用 idea 晋升命令
- **THEN** idea 被移动到目标 change 的 `exploration/` 目录

#### 场景: 规划产物未就绪

- **GIVEN** 目标 change 缺少其 schema 要求的规划产物
- **WHEN** 调用 idea 晋升命令
- **THEN** 系统拒绝晋升
- **AND** 所有源 idea 保持原位

#### 场景: 批量晋升存在冲突

- **GIVEN** 一次晋升多个 idea
- **AND** 任一源文件不存在或任一目标文件发生同名冲突
- **WHEN** 系统执行晋升预检查
- **THEN** 整次操作失败
- **AND** 不移动其中任何一个 idea

#### 场景: 批量移动中发生异常

- **GIVEN** 所有预检查已通过
- **WHEN** 批量移动过程中发生文件系统异常
- **THEN** 系统尝试回滚已移动的文件
- **AND** 报告可定位的失败与回滚结果，避免把部分成功伪装为整体成功

### 需求: Git 操作边界

系统 MUST 只管理工作区文件，不得在 idea 的创建、更新、晋升或删除过程中自动执行 Git 暂存、提交或推送。

#### 场景: 创建 idea 后检查仓库

- **WHEN** 用户创建或更新一个 idea
- **THEN** 文件变更可由 Git 检测
- **AND** 暂存区与提交历史不会被 CLI 自动修改
