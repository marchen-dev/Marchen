## 目的

允许项目持久化关闭自动验收，同时保留显式验收能力和既有记录。

### 需求: 项目配置与兼容

系统 SHALL 支持 `marchen/config.yaml` 中布尔值 `acceptance.enabled`；仅显式 false 关闭自动验收，未配置或 true 时保持原有工作流。升级 MUST 保留用户配置。

#### 场景: 老项目缺省

- **GIVEN** 配置没有 acceptance 或没有 enabled
- **WHEN** 执行工作流
- **THEN** 自动验收视为开启，保持既有行为

#### 场景: 配置持久化

- **GIVEN** 项目设置 `acceptance.enabled: false`
- **WHEN** 更新 Marchen 工作流文件
- **THEN** 关闭设置保留，后续工作流继续使用该设置

### 需求: apply 跳过自动验收

关闭时 apply SHALL 在任务完成后报告结果并提示可归档，不自动创建证据、启动服务、轮询签核或归档；任务已完成的入口 SHALL 使用相同策略，且 MUST NOT 将关闭表述为验收通过。

#### 场景: 本次完成全部任务

- **GIVEN** 自动验收关闭
- **WHEN** apply 完成最后一个任务
- **THEN** 报告实现及正常检查结果，不启动验收，不自动归档

#### 场景: 已完成任务再次进入

- **GIVEN** 自动验收关闭，任务已完成，可能已有 pending、rejected 或 accepted 的验收记录
- **WHEN** 再次执行 apply
- **THEN** 不因历史验收状态自动启动修改或新验收轮次
- **AND** 保留并如实说明已有状态，不能称为已通过验收

### 需求: lite 与 archive 收尾遵循开关

关闭时 lite SHALL 仅提供直接归档与先不动的收尾选择。archive SHALL 保留 artifact 和任务完成度检查，但不因缺失验收或未签核额外询问；已有验收状态与记录 SHALL 保留，不自动转为 accepted。

#### 场景: lite 完成

- **GIVEN** 自动验收关闭
- **WHEN** lite 完成任务
- **THEN** 不显示验收选项；用户选择直接归档后不重复询问是否跳过验收

#### 场景: 未签核但任务已完成

- **GIVEN** 自动验收关闭，artifact 和任务均完成，验收缺失或尚未签核
- **WHEN** 用户要求归档
- **THEN** 不因验收状态阻塞或再次请求确认
- **AND** 已有验收记录随变更归档，已有服务按归档清理流程停止

#### 场景: 任务尚未完成

- **GIVEN** 自动验收关闭但存在未完成任务或 artifact
- **WHEN** 用户要求归档
- **THEN** 仍显示未完成项并按原有规则确认

### 需求: 显式验收与记录保留

用户显式调用 acceptance SHALL 覆盖当次的自动验收关闭设置，执行完整验收且不修改项目开关。关闭开关 MUST NOT 删除记录、停止已经运行的服务或伪造人的签核，也 MUST NOT 免除正常代码验证。

#### 场景: 关闭后手动验收

- **GIVEN** `acceptance.enabled: false`
- **WHEN** 用户显式调用 acceptance
- **THEN** 执行取证、页面和人工签核流程，项目配置仍为 false

#### 场景: 已存在验收记录和服务

- **GIVEN** 项目已有证据、决定和运行中的验收服务
- **WHEN** 将自动验收配置设为 false
- **THEN** 既有记录不变，服务可继续运行或通过 acceptance stop 显式停止
