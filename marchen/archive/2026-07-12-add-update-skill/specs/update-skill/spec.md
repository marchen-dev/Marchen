# update-skill

## 目的

`/marchen:update` skill 的行为规格:修订变更的已有规划产物并保持彼此一致,绝不修改实现代码。

### 需求: 变更选择

未提供变更名称时,skill MUST 通过可用变更列表让用户选择,SHALL NOT 猜测或自动选定(唯一例外:只有一个 open 变更时 MAY 自动选择并明示)。

#### 场景: 未指定名称且存在多个 open 变更

- **GIVEN** 存在两个以上 open 变更
- **WHEN** 用户调用 `/marchen:update` 未带名称且上下文无法推断
- **THEN** skill 列出变更(名称、schema、任务进度、创建时间)供用户选择
- **AND** 不自动选定任何一个

#### 场景: 指定了变更名称

- **GIVEN** 用户调用 `/marchen:update add-auth 把 design 改成 Redis`
- **WHEN** skill 解析输入
- **THEN** 直接使用 `add-auth`,以"design 改成 Redis"为起点修改

### 需求: 产物清单获取

skill MUST 通过 `marchen status <name> --json` 获取产物的 id、状态与路径,SHALL NOT 基于硬编码产物名做分支判断;自定义 schema MUST 原样可用。

#### 场景: 读取 full schema 变更

- **GIVEN** 变更使用 full schema
- **WHEN** skill 执行 status 命令
- **THEN** 从返回 JSON 的 `artifacts[]` 得到各产物状态与相对路径
- **AND** specs 目录型产物通过 `capabilities[]` 拼出 `specs/<capability>/spec.md` 文件列表

#### 场景: lite schema 自动退化

- **GIVEN** 变更使用 lite schema(仅 tasks 一个产物)
- **WHEN** 用户要求修订 tasks
- **THEN** skill 正常修订该产物,无其他产物需要调和,流程自然完成

### 需求: 双向调和

落实用户要求的修改后,skill MUST 检查该变更其余 `filled` 产物与修改是否一致——检查方向 SHALL 不受构建顺序限制(修改后置产物可能要求回改前置产物)。

#### 场景: 修改 design 引发 proposal 回改

- **GIVEN** 变更的 proposal、design、tasks 均已填充
- **WHEN** 用户要求把 design 的方案从 X 改为 Y,而 proposal 的变更内容一节仍描述 X
- **THEN** skill 在修订 design 之外,提出对 proposal 的对应修订建议

#### 场景: 变更本已自洽

- **GIVEN** 用户只说"update"未给出具体修改
- **WHEN** skill 通读所有 filled 产物未发现矛盾、缺口或重复
- **THEN** 明确告知变更自洽,不做任何修改

### 需求: 确认后写入

每一处产物修订 MUST 先向用户展示内容与理由,经确认后方可写入;被拒绝的修订 SHALL NOT 写入。

#### 场景: 用户拒绝某处修订

- **GIVEN** skill 提出对 proposal 和 tasks 各一处修订
- **WHEN** 用户确认 tasks 的修订、拒绝 proposal 的修订
- **THEN** 仅 tasks 落盘,proposal 保持原样
- **AND** 结束输出中如实报告被拒绝的修订

### 需求: 只改规划产物

skill MUST 只编辑 `marchen/changes/<name>/` 下已存在(`filled`)的规划产物文件;SHALL NOT 修改实现代码、创建缺失产物或在 specs 下新建 capability 目录。

#### 场景: 修订后的计划意味着代码改动

- **GIVEN** 变更已实现过(tasks 已勾选)
- **WHEN** 修订后的计划与已实现代码不再一致
- **THEN** skill 停止于计划层,指向 `/marchen:apply` 承接代码侧差异

#### 场景: 发现产物缺失

- **GIVEN** 变更的 design 状态为 missing
- **WHEN** 调和过程发现 design 缺失导致信息断档
- **THEN** skill 仅报告该缺失并指向补全途径,不代为创建

### 需求: 下一步指引

skill 结束时 MUST 报告修订结果与变更当前状态,并给出下一步建议(补全/apply/archive);该建议 SHALL 仅为提示,skill 不代为执行。

#### 场景: 修订完成后的收尾输出

- **GIVEN** 本次调用修订了 design 与 tasks
- **WHEN** 全部确认写入完成
- **THEN** 输出列出已修订产物、被拒绝的修订、缺失产物(如有)
- **AND** 按变更状态推荐下一条命令

### 需求: 意图变更识别

当用户诉求改变的是变更的意图方向而非细化时,skill SHOULD 建议通过 `/marchen:propose` 重开新变更,而非在原变更上硬改。

#### 场景: 诉求推翻变更方向

- **GIVEN** 变更 add-auth 的意图是"新增第三方登录"
- **WHEN** 用户要求"改成先做账号密码登录,第三方以后再说"
- **THEN** skill 指出这是意图变更,建议重开变更,不直接重写产物
