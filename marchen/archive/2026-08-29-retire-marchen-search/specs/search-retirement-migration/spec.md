## 目的

完整退役 Marchen 内置搜索，并让新旧工作区在不破坏历史资料或用户缓存的前提下迁移到基于 changelog 与 archive 的确定性历史调查方式。

### 需求: CLI 不再提供内置搜索

Marchen SHALL 从公开命令集合中移除 `search`，且其他命令 MUST 不再隐式准备搜索引擎、模型或索引。

#### 场景: 查看 CLI 帮助

- **GIVEN** 用户安装了包含本变更的 Marchen
- **WHEN** 用户查看顶层 CLI 帮助
- **THEN** 命令列表中不包含 `search`
- **AND** 其他现有命令仍可正常注册和使用

#### 场景: 执行已退役命令

- **GIVEN** 用户安装了包含本变更的 Marchen
- **WHEN** 用户执行 `marchen search "历史决策"`
- **THEN** CLI 按未知命令处理
- **AND** 不加载模型、不创建索引、不访问模型下载源

### 需求: 新工作区不产生搜索状态

`marchen init` SHALL 只初始化当前工作流所需的目录、配置和托管文件，不得询问搜索选项或生成搜索专用状态。

#### 场景: 初始化新工作区

- **GIVEN** 当前目录尚未初始化 Marchen
- **WHEN** 用户完成 `marchen init`
- **THEN** 初始化过程不询问是否启用搜索
- **AND** `config.yaml` 不包含 `search` 或仅供搜索使用的 `models` 配置
- **AND** 初始化过程不创建 `.search` 索引目录或下载模型

### 需求: 旧工作区可通过 update 完成配置与模板迁移

`marchen update` MUST 从 Marchen 自有配置中移除废弃的搜索与搜索模型字段，并 SHALL 用当前模板刷新所选 provider 的托管 Skill/Command 文件，同时保留无关配置。

#### 场景: 更新启用过搜索的旧工作区

- **GIVEN** 旧工作区的 `config.yaml` 包含 `search.enabled` 和 `models.endpoint`
- **AND** 托管的 Explore 或 Apply 文件仍引用 `marchen search`
- **WHEN** 用户执行 `marchen update`
- **THEN** 更新后的配置不包含废弃搜索字段
- **AND** 所选 provider 的最新版托管文件不再引用内置搜索
- **AND** schema、providers 及其他非搜索配置保持不变

#### 场景: 重复更新已迁移工作区

- **GIVEN** 工作区已经完成搜索退役迁移
- **WHEN** 用户再次执行 `marchen update`
- **THEN** 命令成功完成且不会重新加入搜索配置或搜索指引
- **AND** 迁移结果保持幂等

### 需求: 归档不再维护搜索索引

归档变更 SHALL 只完成归档目录迁移和 changelog 更新，不得因搜索退役而增加等待、创建索引或调用搜索依赖。

#### 场景: 归档已完成变更

- **GIVEN** 一个满足归档条件的 open change
- **WHEN** 用户执行归档
- **THEN** 变更被移入 archive 并追加 changelog 条目
- **AND** 归档过程不创建或更新 `.search/index.sqlite`
- **AND** 归档结果不依赖搜索组件是否存在

### 需求: Skill 使用确定性的历史调查路径

Marchen 生成的历史调查指引 SHALL 先读取 `changelog.md`，再按相关摘要读取具体 archive 文件；Skill MUST 不再要求或建议调用已退役的内置搜索。

#### 场景: Explore 调查历史决策

- **GIVEN** 项目包含 changelog 与多个归档变更
- **WHEN** Explore 需要查找相关历史决策
- **THEN** 指引要求先扫描 changelog 定位候选归档
- **AND** 再读取候选归档中的 proposal、design 或 spec
- **AND** 指引中不存在 QMD、embedding、相关度阈值或 `marchen search` 调用

#### 场景: Apply 遇到不确定的历史决策

- **GIVEN** Apply 在实现过程中需要核对过往方案
- **WHEN** 它遵循生成的工作流指引
- **THEN** 指引使用 changelog 与 archive 获取上下文
- **AND** 不依赖内置搜索可用性

### 需求: 历史资料与遗留缓存保持安全

搜索退役 MUST 保留既有 archive 与 changelog 历史记录，并 MUST NOT 自动删除项目遗留索引或用户级 QMD 模型缓存。系统 SHOULD 继续避免把遗留索引纳入版本控制，并 MAY 提供明确标注为可选的手动清理说明。

#### 场景: 更新存在遗留索引的项目

- **GIVEN** 项目中已有被忽略的 `.search/index.sqlite`
- **WHEN** 用户执行 `marchen update` 或归档变更
- **THEN** 遗留索引文件不会被自动删除或修改
- **AND** 该索引继续保持为非版本控制内容

#### 场景: 主机存在共享模型缓存

- **GIVEN** 用户主目录中存在可能被独立 QMD 工具使用的模型缓存
- **WHEN** 用户安装、更新或使用退役搜索后的 Marchen
- **THEN** Marchen 不删除该缓存
- **AND** 文档如提供清理命令，必须说明这是用户自行决定的可选操作

### 需求: 发行产物不再携带搜索依赖

Marchen 的安装和构建产物 MUST 不再要求 QMD、LLM 原生运行时或搜索模型下载链路，并 SHALL 保持非搜索功能的构建与测试可用。

#### 场景: 安装和构建新版 Marchen

- **GIVEN** 干净的依赖环境
- **WHEN** 用户安装依赖并构建 Marchen
- **THEN** 依赖解析不再包含 Marchen 直接引入的 QMD 或搜索专用 LLM 运行时
- **AND** CLI、Core、Config 与 Shared 的构建和测试通过
