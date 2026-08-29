## 背景

当前搜索链路跨越整个仓库：CLI 注册 `search` 命令，`init`/`update` 负责模型准备，Core 的 SearchManager 封装 QMD，Workspace 维护 `.search/index.sqlite` 与 `search/models` 配置，ChangeManager 在 archive 后尝试更新索引，Config 模板又让 Explore/Apply 主动调用搜索。CLI 和 Core 还直接依赖 QMD 与 `node-llama-cpp`，CLI 构建必须把原生依赖 external。

这意味着“隐藏 search 命令”并不能完成退役：用户仍可能在初始化或更新时下载模型，archive 仍可能等待索引，旧配置和生成后的 Skill 仍把功能视为存在。另一方面，`marchen/changelog.md` 已经是归档摘要索引，archive 内保留完整 proposal、design、specs 与 tasks，可以承担无模型的确定性历史调查。

仓库同时存在进行中的 `add-idea-capture-workflow` 变更，它计划让 Explore 读取 idea 元数据，并明确不在自身范围内退役 QMD。两个变更会共同触及 Explore 模板，因此搜索退役方案必须不依赖二者的合入顺序，也不能误删 idea 工作流。

## 目标与非目标

**目标：**

- 从 CLI、Core、Shared、Config、构建和依赖图中完整移除项目内 search/QMD 能力。
- 让 init、update、archive 的运行路径不再准备模型或索引。
- 让旧工作区通过显式 update 清理废弃配置和托管模板，同时保持其他配置不变。
- 用 changelog → archive 的确定性路径替代 Skill 中的搜索指引，并兼容 idea 工作流后续合入。
- 保留历史记录和用户可能仍需的本地数据，避免退役动作扩大为数据清理。

**非目标：**

- 不实现新的全文、模糊或语义搜索替代品。
- 不改变 changelog 与 archive 的格式、归档语义或历史内容。
- 不删除 `marchen/.search`、`~/.cache/qmd/models` 或其他工具管理的缓存。
- 不修改独立 QMD 工具、HuggingFace 环境变量或主机级配置。
- 不在本变更中实现 idea capture 生命周期；只保证模板合并时保留其能力。

## 决策

### D1：按纵向链路一次性退役，不保留兼容命令

删除 CLI 注册与命令文件、Core 搜索类和模型常量、archive hook、Workspace 搜索路径、Shared 配置字段、模型进度工具、构建 external 与直接依赖。`marchen search` 变为普通未知命令，不提供空实现、弃用代理或隐藏开关。

保留兼容命令会继续占用公共命令面，并暗示未来仍存在搜索实现；仅做 deprecated 提示也无法消除原生依赖和模型维护。这个变更应作为明确的 breaking removal，在 release notes 中说明迁移路径。

### D2：配置迁移属于 update 的独立职责

新初始化配置不再写入 `search` 与 `models`。旧工作区执行 update 时，Workspace 删除这两个 Marchen 自有字段，并原样保留 schema、providers、version 之外的其他未知字段。

配置清理应在“版本相同则跳过模板更新”的判断之前执行或采用等价结构，确保显式 update 即使面对异常的同版本旧配置也能完成迁移。迁移使用字段删除而非写入 `enabled: false`，避免废弃 schema 永久残留；重复执行必须幂等。

模板仍按现有 provider 清单刷新。若版本未变化且模板已是当前版本，可以维持既有跳过策略，但配置迁移不能被该策略跳过。

### D3：运行时代码不删除遗留索引或全局模型缓存

初始化不再创建 `.search`，update 和 archive 也不读写旧索引；已有文件保持原样。根 `.gitignore` 继续保留 `.search/`，防止功能退役后旧 SQLite 文件突然出现在 Git 状态中。

`~/.cache/qmd/models` 可能被独立 QMD 或其他程序共享，Marchen 无法证明其所有权，因此绝不自动删除。README/release notes 可以给出可选清理位置和风险说明，但不把清理作为迁移成功条件。

### D4：以模板源为真相源，生成产物必须同步

先修改 `packages/config/templates/skills` 与 `templates/commands` 下的 Explore/Apply 源模板，再运行现有 codegen 更新 `src/generated`。仓库当前启用的 `.agents`、`.claude/skills` 与 `.claude/commands` 属于 Marchen 托管输出，也要通过正常生成/update 路径同步，而不是只手工修改其中一份。

验证时对非历史路径做残留扫描，确保当前模板和生成产物不再出现 `marchen search`、QMD、embedding、Hybrid Search、模型下载等功能性指引。propose-preview 中仅作为示例的 `SearchManager` 名称也应换成仍存在的技术名词，避免文档引用已删除 API。

### D5：历史恢复统一为 changelog → archive

Explore 的基础调查顺序为：列出当前 change、扫描 changelog 摘要、读取少量相关 archive artifact。Apply 遇到不确定决策时使用同一入口。该路径不设数值阈值、不声称语义匹配，也不依赖网络或本地模型。

如果 `add-idea-capture-workflow` 先合入，搜索退役只删除其中的 search/QMD 分支，保留 ideas 元数据匹配；如果本变更先合入，idea capture 后续在 changelog/archive 基础上增加 ideas。最终模板应同时容纳 ideas（若已实现）与 changelog/archive，不能用旧模板整段覆盖新能力。

### D6：依赖清理以 workspace lockfile 为完成边界

从 CLI 与 Core manifest 删除 `@tobilu/qmd` 和 `node-llama-cpp`，删除 CLI tsdown 的对应 `neverBundle` 项，再用 pnpm 重新解析 lockfile。只有在仓库其他包没有独立消费者时，lockfile 中相关依赖闭包才应完全消失。

完成标准不仅是 TypeScript 无 import，还包括干净安装不再因 Marchen 搜索触发原生 LLM 依赖安装，CLI bundle 不再依赖这些运行时 external。

### D7：历史 archive 与 changelog 不参与清理扫描

`marchen/archive` 和 `marchen/changelog.md` 记录功能曾经存在以及当时的设计决策，必须保留。残留检查需要区分当前代码/模板/文档与历史资料；不能为了得到零搜索结果而重写归档历史。

当前打开的 `add-idea-capture-workflow` proposal 中“QMD 退役不纳入本变更”同样是有效的范围记录，不需要删除。

## 风险与权衡

- **外部脚本破坏**：依赖 `marchen search` 的脚本会立即失败。选择明确移除而不是兼容壳，以换取依赖和维护成本真正归零；必须在发布说明中标注 breaking change。
- **旧模板残留**：只发布新模板不能自动修改用户磁盘上的旧生成文件。用户需要执行 `marchen update`，文档应把它列为升级步骤，并用临时旧工作区验证实际覆盖结果。
- **同版本迁移被跳过**：Workspace 当前会在版本一致时提前返回。若不调整判断顺序，废弃配置可能永久保留，因此必须有同版本旧配置测试。
- **并行变更冲突**：本变更与 idea capture 都修改 Explore 模板和生成常量。实现时要基于最终文件做语义合并，不能把另一变更的新段落回滚。
- **残留索引占用空间**：不自动删除意味着项目和主机不会立即回收磁盘空间。这是数据安全优先的取舍，由用户按文档自行清理。
- **确定性调查召回率下降**：changelog 摘要可能遗漏语义相关但用词不同的历史。可通过保持摘要质量、读取少量候选 archive 缓解；本变更不引入新的检索系统。
- **误删通用模型配置**：当前 `models.endpoint` 仅服务 QMD，但实现前仍应确认没有非搜索消费者；若出现新消费者，应只删除搜索专属字段而不是整个 models 命名空间。
- **历史残留误报**：全仓 `rg search` 会命中 archive、changelog 及其他工具自身的 search 术语。验收扫描必须限定功能性标识和非历史路径，避免误删事实记录。
