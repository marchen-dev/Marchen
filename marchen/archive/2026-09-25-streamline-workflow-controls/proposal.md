## 动机

名称选择规则存在重复确认与冲突：archive 允许从上下文推断或选择唯一变更，同时又要求未提供名称必须询问；update 在多个变更存在时也可能要求用户重新选择已经明确的目标。用户应能接着当前讨论执行操作，无须重复报名称。

apply 完成后强制进入本地验收，而 lite 已支持直接归档。项目目前无法统一关闭自动验收，关闭验收服务也不等于关闭工作流，需要一个明确、可持久化的配置。

## 变更内容

- 统一 apply、update、archive、acceptance、propose-preview 的目标选择：显式名称优先，其次明确的对话上下文，再其次唯一 open 变更；仅多个合理候选无法确定时询问，不绑定 AskUserQuestion 工具。
- 删除 archive 与 update 中和上述规则冲突的强制确认文案。名称选择之外的询问不在本次全面改写范围。
- 增加项目级 `acceptance.enabled`，缺省为 true，设置 false 关闭自动验收及因未签核产生的归档提示。
- 关闭时 apply 的正常完成和 all_done 分支均跳过自动验收；lite 不再展示验收选项；archive 仍检查任务与 artifact 完成度。
- 用户显式调用 acceptance 仍可当次验收；已有证据和决定保留，关闭不代表验收通过，也不免除正常测试。
- 同步 skill/command 模板、生成产物及使用说明。

## 能力

### 新增能力

- `acceptance-control`：项目级自动验收开关、缺省兼容及手动验收覆盖规则。

### 修改能力

- `change-selection`：现有五个流程的上下文优先选择与必要时消歧。

## 影响范围

- `packages/shared` 的工作区配置类型，`packages/core` 的初始化与配置兼容测试。
- `packages/config/templates/skills` 与 `templates/commands` 中相关流程，以及 codegen 产物。
- 工作区已安装的 Marchen skill/command 文件及 README 配置说明。
- 不改变 CLI 必填名称参数、不新增自动归档、不修改 acceptance 页面或签核协议，不更改已有 archive 历史。
- 保留当前 `marchen/config.yaml` 的用户改动，不在实现时替用户关闭本仓库验收。
