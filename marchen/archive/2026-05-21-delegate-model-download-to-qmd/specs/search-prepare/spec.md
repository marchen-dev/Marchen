## 目的

`SearchManager.prepare()` 在调用 qmd `createStore` 前完成最小化准备：解析并设置 HuggingFace 端点环境变量、初始化 store；不再承担模型下载职责。

### 需求: prepare SHALL 在初始化 store 前设置 HuggingFace 端点环境变量

#### 场景: 设置默认端点

- **GIVEN** `HF_ENDPOINT` 未设置
- **AND** 工作区 config 包含 `models.endpoint`
- **WHEN** 调用 `prepare()`
- **THEN** `process.env.HF_ENDPOINT` 被设置为 config 中的值
- **AND** qmd `createStore` 之后的任何下载行为均走该端点

#### 场景: 不覆盖用户已设置的环境变量

- **GIVEN** `HF_ENDPOINT` 已被用户/外层显式设置
- **WHEN** 调用 `prepare()`
- **THEN** `process.env.HF_ENDPOINT` 保持原值不变

### 需求: prepare SHALL 不再触发模型下载

#### 场景: 模型缺失时直接调用 prepare 抛出错误

- **GIVEN** 本地缓存目录中模型文件不存在
- **WHEN** 调用 `prepare()`（未先调用 ensureModels）
- **AND** 随后调用 `search()` 触发 qmd 内部 embed 操作
- **THEN** qmd 会按其自身策略尝试下载（或失败）
- **AND** `prepare()` 自身不发起任何下载请求

#### 场景: 模型已就绪时 prepare 仅初始化 store

- **GIVEN** 模型已通过 ensureModels 下载到本地
- **WHEN** 调用 `prepare()`
- **THEN** 仅执行 `createStore` 初始化
- **AND** 不读取或校验本地 manifest 文件
- **AND** prepared 状态被标记，后续重复调用立即返回
