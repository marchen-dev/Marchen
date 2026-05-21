## 目的

确保 QMD 搜索所需的三个 GGUF 模型在本地就绪并可被 qmd 命中，下载源遵循 `hf-endpoint-config` 的端点解析规则。

### 需求: 系统 SHALL 通过 node-llama-cpp 的下载链路获取三个 QMD 模型

#### 场景: 全部模型缺失时依次下载

- **GIVEN** 本地缓存目录中三个 GGUF 模型均不存在
- **WHEN** 调用模型确保方法
- **THEN** embed、generate、rerank 三个模型按序下载到本地缓存目录
- **AND** 下载源由解析后的 HuggingFace 端点决定
- **AND** 每个模型的下载进度通过回调上报

#### 场景: 部分模型已存在时仅下载缺失项

- **GIVEN** 本地缓存目录中已存在 embed 模型
- **AND** generate 和 rerank 模型不存在
- **WHEN** 调用模型确保方法
- **THEN** 仅 generate 和 rerank 被下载
- **AND** embed 模型被原样复用，不重复下载

#### 场景: 全部模型已存在时不触发下载

- **GIVEN** 三个 GGUF 模型均已存在于本地缓存目录
- **WHEN** 调用模型确保方法
- **THEN** 不发起任何网络请求
- **AND** 方法立即返回

### 需求: 模型下载目标目录 SHALL 与 qmd 默认缓存目录保持一致

#### 场景: 默认目录对齐 qmd

- **GIVEN** 未设置 `XDG_CACHE_HOME` 环境变量
- **WHEN** 模型被下载
- **THEN** 文件落地到 `~/.cache/qmd/models/`
- **AND** 后续 qmd `createStore` 调用能直接命中这些文件，不触发二次下载

#### 场景: 遵循 XDG_CACHE_HOME

- **GIVEN** `XDG_CACHE_HOME` 环境变量被设置
- **WHEN** 模型被下载
- **THEN** 文件落地到 `$XDG_CACHE_HOME/qmd/models/`

### 需求: 下载进度回调字段 SHALL 与现有 spinner 渲染逻辑兼容

#### 场景: 进度回调暴露字节数

- **GIVEN** 调用方传入 `onProgress` 回调
- **WHEN** 单个模型正在下载
- **THEN** 回调被定期触发，参数包含当前模型标识、已下载字节数、总字节数和阶段
- **AND** CLI spinner 可据此渲染百分比和文件大小
