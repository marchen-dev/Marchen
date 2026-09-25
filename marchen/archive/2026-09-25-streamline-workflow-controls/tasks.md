## 1. 配置与兼容

- [x] 1.1 扩展 WorkspaceConfig 的可选 acceptance.enabled 布尔字段并添加文档注释；初始化写入默认 true，旧项目缺省开启。
- [x] 1.2 验证配置读取与 update 保留 false、其他配置字段及同版本更新行为，补充必要的配置回归测试；保留本仓库已有 config.yaml 改动。

## 2. 统一目标选择

- [x] 2.1 同步修改 apply、update、archive、acceptance、propose-preview 的 skill/command 源模板，采用显式名称、明确上下文、唯一 open 变更、必要时询问的优先级。
- [x] 2.2 移除 archive/update 冲突护栏及名称选择对 AskUserQuestion 的硬绑定，补充无目标/目标不存在处理与选定名称展示；不改其他询问场景。

## 3. 验收开关衔接

- [x] 3.1 在 apply、lite、archive 模板中明确配置读取、缺省开启和仅布尔 false 关闭规则，说明无效配置处理。
- [x] 3.2 修改 apply 正常完成及 all_done 分支，关闭时不自动进入取证、签核或基于历史 rejected 的返工，不自动归档，保留已有状态并正常报告检查结果。
- [x] 3.3 修改 lite 收尾：关闭时仅提供直接归档和先不动；修改 archive：关闭时跳过未签核确认，保留未完成任务/artifact 检查及已有服务清理。
- [x] 3.4 在 acceptance 模板明确显式调用可当次覆盖关闭设置，保留人工签核和多轮流程；不修改项目开关、不删除证据或伪造 accepted。

## 4. 文档与生成同步

- [x] 4.1 更新相关 README 的配置示例和工作流描述，说明默认开启、关闭效果、显式验收覆盖、与 acceptance stop 的区别。
- [x] 4.2 运行现有构建和 generate 流程，更新模板常量并同步本仓库已安装 provider 的对应 skill/command，避免改写用户 config.yaml 或手改生成常量。

## 5. 验证

- [x] 5.1 按 specs 检查五个流程在显式目标、多候选但上下文明确、唯一目标、真实歧义、无目标时的行为；核对 skill 与 command 一致，确认不存在冲突护栏。
- [x] 5.2 核对开启/缺省/关闭下的 apply 两种完成路径、lite、archive、显式 acceptance 行为矩阵，包含历史 pending/rejected/accepted、证据保留和不自动归档边界。
- [x] 5.3 运行相关配置测试、项目要求的 lint/typecheck/test 与构建检查，检查生成同步及 diff；交付时区分静态模板验证、自动测试与尚未进行的实际 Agent 会话验证。
