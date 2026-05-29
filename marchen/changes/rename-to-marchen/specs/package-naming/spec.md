## 目的

定义项目的命名标识规格——品牌名、npm 主包名、内部 scope、root package name 的统一规则，以及哪些既有标识（CLI 命令、目录、skill 前缀、历史归档）必须保持不变的边界约束。

### 需求: 统一对外命名标识

项目的对外品牌名、npm 主包名、内部 scope 与 root package name SHALL 统一收敛为 `marchen`，不再包含 `spec` 后缀；品牌名以 `Marchen` 呈现，包标识以小写 `marchen` / `@marchen` 呈现。

#### 场景: 从 npm 安装工具

- **GIVEN** 用户想安装本工具
- **WHEN** 执行 `npm install -g marchen`
- **THEN** 安装成功并获得可执行命令 `marchen`
- **AND** npm 包页面与文档中的品牌标识显示为 `Marchen`

#### 场景: 内部包使用统一 scope

- **GIVEN** monorepo 中的内部包（core、config、fs、shared）
- **WHEN** 查看其包名与相互依赖声明
- **THEN** 均使用 `@marchen/*` scope
- **AND** 因保持 `private` 且被主包打包，不会发布到 npm registry

### 需求: 运行时标识保持稳定

本次改名 SHALL NOT 改变 CLI 可执行命令名、工作区目录名与 skill 前缀，三者必须保持为 `marchen`，以避免破坏既有用户的工作区、脚本与 AI 工具集成。

#### 场景: 已有工作区不受影响

- **GIVEN** 一个用旧版本初始化、已存在 `marchen/` 目录的项目
- **WHEN** 用户升级到改名后的版本并运行任意 `marchen` 命令
- **THEN** 命令正常识别并操作既有 `marchen/` 工作区
- **AND** 用户无需迁移目录或重新初始化

#### 场景: skill 调用前缀不变

- **GIVEN** 用户在 AI 工具中使用 `marchen:` 前缀的 skill
- **WHEN** 改名后重新生成 / 同步 skill 文件
- **THEN** skill 前缀仍为 `marchen:`
- **AND** 既有 skill 调用方式无需调整

### 需求: 历史归档保持原样

`marchen/archive/**` 与 `marchen/changelog.md` 中记录的历史命名标识 MUST 保持不变，不得被本次改名替换——它们是反映当时真实状态的历史快照。

#### 场景: 归档历史不被篡改

- **GIVEN** 归档目录与 changelog 中存在记录旧标识（`MarchenSpec`、`@marchen-spec`、`marchenspec`）的历史变更
- **WHEN** 执行本次改名
- **THEN** 这些历史文件内容保持原样
- **AND** 仅活跃代码、配置与文档中的标识被更新

### 需求: 旧 npm 包平滑迁移

旧 npm 包 `marchen-spec` SHALL 发布一版废弃声明（deprecation）指向新包 `marchen`，使旧用户在安装或升级时获得明确的迁移提示，避免与既有搜索收录、文档链接断联。

#### 场景: 旧包安装时提示迁移

- **GIVEN** 用户安装或升级旧包 `marchen-spec`
- **WHEN** npm 解析该包
- **THEN** 输出 deprecation 提示
- **AND** 提示引导用户改用新包 `marchen`
