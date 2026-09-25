## 背景

名称推断和验收衔接由 skill/command 模板控制。CLI 的 archive 仍要求显式名称，ChangeManager 归档本身不以验收签核为门禁。WorkspaceConfig 目前只有 schema、providers、version；Workspace.update 保留未退役的配置字段。模板源文件经 generate 写入 generated 常量，再安装到各 provider 目录。

当前工作区 main 上已有 marchen/config.yaml 的用户改动，实施时必须保留。

## 目标与非目标

**目标：**

- 五个已有变更操作共享一致的目标选择语义，避免上下文已明确仍重复确认。
- 用一个项目布尔配置控制自动验收，兼容旧项目，并覆盖所有收尾入口。
- 手动验收可继续使用，既有记录和人工决定语义保持完整。

**非目标：**

- 不给 CLI 添加省略名称的自动选择，不增加全局配置、单变更开关或配置管理命令。
- 不全面移除其他 AskUserQuestion 文案，不改变 propose/lite 的需求澄清和同名冲突处理。
- 不更改验收 UI、签核数据结构、证据格式、HTTP 服务协议或自动归档策略。

## 决策

### 1. 在模板层统一名称选择

apply、update、archive、acceptance、propose-preview 的 skill 与 command 都采用相同顺序：

```text
显式名称 → 明确上下文 → 唯一 open 变更 → 有歧义才询问
```

明确上下文优先于候选数量，因此存在多个 open 变更不自动意味着需要询问。移除 archive 的无条件确认护栏和 update 的多个候选一律询问限制。询问可使用执行环境可用的原生工具或文字；不要求名为 AskUserQuestion 的工具。找不到目标时报告问题，不回退到其他变更。选定后明示名称。

### 2. 配置只控制自动衔接

WorkspaceConfig 增加可选 `acceptance?: { readonly enabled?: boolean }`，新增字段附 JSDoc。初始化写入 `acceptance: { enabled: true }` 让开关可发现；旧配置不需要迁移，缺省仍开启。update 保留原值，不能覆盖用户的 false。

```yaml
acceptance:
  enabled: false
```

apply、lite、archive 模板在进入流程时读取当前工作区 marchen/config.yaml，在决定验收收尾前以当前配置为准；只有 YAML 布尔 false 关闭，字符串 "false" 等无效类型不能静默当作关闭，应说明类型问题并保持开启。配置不可读或 YAML 损坏时报告问题，不推定验收已关闭。

这次不新增 CLI 配置 API：开关作用于 Agent 工作流，由模板明确读取配置即可。应用代码中的配置读写继续走 Workspace 与 fs 包，CLI 不承担业务判断。

### 3. 覆盖全部控制流

| 入口 | 开启或未配置 | 关闭 |
| --- | --- | --- |
| apply 从未完成到完成 | 保留自动验收 | 报告结果和归档入口，结束 |
| apply all_done | 保留现有验收状态分流 | 不进入状态驱动的修改、取证、轮询；已有状态仅如实报告 |
| lite 完成 | 保留原四个选项 | 仅直接归档、先不动 |
| archive | 保留未签核检查 | 跳过未签核警告和确认；仍检查任务/artifact |
| 显式 acceptance | 完整验收 | 当次覆盖关闭设置，完整验收 |

关闭不表示 accepted，不自动改写 decision，不自动处理历史 rejected 意见。用户显式要求处理反馈或验收时按该请求继续。关闭后的归档仍清理已有服务，已有证据随目录归档；单纯修改开关不触发进程操作或记录删除。正常代码测试和验证不受开关影响。apply 完成后仅提示归档，不自动执行；lite 保留用户选择。

### 4. 源模板与安装产物保持一致

修改 templates/skills 与 templates/commands，然后使用现有 generate 流程更新生成常量，不手改 generated 文件。使用本次构建的本地 CLI 同步本仓库已安装 provider 的文件；若同版本 update 跳过，则采用已有机制或精确同步生成内容，不为刷新模板擅自修改用户版本字段。README 中补充配置示例、默认值、显式调用覆盖及 stop 的区别。

## 风险与权衡

- 模板行为由 Agent 执行，静态测试无法证明所有模型都会遵循；验证时应分别说明模板一致性检查与实际会话观察。
- 只改正常完成路径会遗漏 all_done，或让 archive 再次问未签核；以入口行为矩阵检查完整性。
- 已有 rejected 记录在关闭后不再自动触发返工，必须如实保留状态，避免把跳过验收描述为问题解决。
- 多 provider 文件与生成常量可能漂移；生成后比对相关文件，保持源模板为真相。
- 不新增核心 API 可以缩小范围，但 Agent 需要读一次配置；如将来出现多个需要机器读取的策略，再引入统一配置查询接口。

验证包含默认配置和旧配置兼容、update 保留 false、五个流程的目标消歧场景、开关行为矩阵、手动验收覆盖、生成及安装内容一致性。无需修改或启动验收 UI 来证明此配置与模板变更。
