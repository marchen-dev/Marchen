## 目的

控制 HuggingFace 模型下载源，让国内用户开箱即用国内镜像，同时保留覆盖能力供用户切换到官方或自定义镜像。

### 需求: 系统 SHALL 在初始化新工作区时将 `models.endpoint` 默认值写入 `config.yaml`

#### 场景: 新初始化工作区写入默认镜像

- **GIVEN** 用户运行 `marchen init` 初始化全新工作区
- **WHEN** `config.yaml` 被生成
- **THEN** 文件包含 `models.endpoint: https://hf-mirror.com` 字段
- **AND** 该值即时生效，无需用户额外配置

### 需求: 系统 SHALL 按 env → config → 代码默认的优先级解析 HuggingFace 端点

#### 场景: 环境变量优先级最高

- **GIVEN** `config.yaml` 中 `models.endpoint` 为 `https://hf-mirror.com`
- **AND** 用户设置 `HF_ENDPOINT=https://huggingface.co`
- **WHEN** 模型下载或 store 初始化触发
- **THEN** 实际使用的端点为 `https://huggingface.co`
- **AND** `config.yaml` 的值被环境变量覆盖

#### 场景: 缺省环境变量时使用 config 值

- **GIVEN** 未设置 `HF_ENDPOINT` 环境变量
- **AND** `config.yaml` 中 `models.endpoint` 为 `https://example.com`
- **WHEN** 模型下载或 store 初始化触发
- **THEN** 实际使用的端点为 `https://example.com`
- **AND** `process.env.HF_ENDPOINT` 被设置为 `https://example.com`

#### 场景: env 和 config 都缺失时使用代码默认

- **GIVEN** 未设置 `HF_ENDPOINT` 环境变量
- **AND** `config.yaml` 不存在 `models.endpoint` 字段（如老版本初始化的 config）
- **WHEN** 模型下载或 store 初始化触发
- **THEN** 实际使用的端点为 `https://hf-mirror.com`（代码兜底默认）

### 需求: `marchen update` SHALL 给缺失 `models` 段的老 config 自动补齐默认值

#### 场景: 老 config 升级补字段

- **GIVEN** 工作区的 `config.yaml` 由旧版本 marchen 初始化，不包含 `models` 段
- **WHEN** 用户运行 `marchen update`
- **THEN** `config.yaml` 被补充 `models.endpoint: https://hf-mirror.com`
- **AND** 其它字段保持不变

#### 场景: 已配置 endpoint 的 config 不被覆盖

- **GIVEN** 工作区的 `config.yaml` 已设置 `models.endpoint: https://example.com`
- **WHEN** 用户运行 `marchen update`
- **THEN** `models.endpoint` 保持 `https://example.com` 不变
