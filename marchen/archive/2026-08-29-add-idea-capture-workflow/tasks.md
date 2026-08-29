## 1. 共享契约与文件系统能力

- [x] 1.1 在 shared 中新增 idea 目录、格式版本常量以及元数据、摘要、文档、列表问题和操作结果类型，并补充公共 API 文档。
- [x] 1.2 扩展 fs 的 YAML 文本解析/序列化能力，供 Markdown frontmatter 复用，并为有效与无效 YAML 增加测试。
- [x] 1.3 在 fs 中增加排他文本创建、相邻临时文件原子替换和安全文件移动能力，统一封装文件系统错误并覆盖冲突、缺失和清理场景。

## 2. Idea Core 领域模型

- [x] 2.1 扩展 Workspace 暴露 `ideaDir`，让 initialize 和 update 创建可追踪的 `marchen/ideas/.gitkeep`，并更新 Workspace 测试。
- [x] 2.2 新增 idea Markdown 解析与序列化逻辑，校验 kebab-case 名称、format、title、summary、tags、时间和非空正文，同时由文件名派生名称。
- [x] 2.3 实现 IdeaManager 的 list/show：轻量列表按更新时间排序，损坏文件进入 issues 而不中断列表，完整读取返回 SHA-256 revision。
- [x] 2.4 实现 IdeaManager 的 create/update：创建采用排他写入，更新强制校验预期 revision、保留 createdAt 并刷新 updatedAt。
- [x] 2.5 实现 IdeaManager 的 remove，并确保所有名称和路径校验在文件操作前完成。
- [x] 2.6 实现一个或多个 idea 的 promote：复用 ChangeManager 状态验证 full/lite 规划就绪，完成全量预检、目标冲突保护、批量移动和失败回滚报告。
- [x] 2.7 为 IdeaManager 增加覆盖正常生命周期、非法名称、损坏文档、未知格式、陈旧 revision、未就绪 change、批量冲突和回滚异常的单元测试。
- [x] 2.8 从 core 入口导出 IdeaManager 与所需类型，检查包依赖仍保持 shared/config/fs → core 的单向边界。

## 3. `marchen idea` CLI

- [x] 3.1 在 CLI context 中构造 IdeaManager，并注册 `marchen idea` 父命令及 list/show 子命令的人类可读和 JSON 输出。
- [x] 3.2 增加可靠的 stdin 读取工具，实现 create/update 子命令、`--stdin` 必填校验、revision 参数和结构化成功输出。
- [x] 3.3 实现 promote 的可变数量 idea 参数、目标 change 参数及人类/JSON 输出。
- [x] 3.4 实现 remove 的交互确认与 `--yes` 非交互路径，取消时保持文件不变。
- [x] 3.5 增加 CLI 测试，覆盖 JSON stdout 纯净性、非零失败状态、stdin、确认取消和每个子命令到 Core 的调用契约。

## 4. Capture 与工作流 Skill

- [x] 4.1 新增 capture Skill 模板：生成结构化探索快照、清理明显敏感信息、区分 create/update、携带 revision，并明确不执行 Git 操作。
- [x] 4.2 新增支持 Slash Command Provider 的 capture Command 模板，并保证与 Skill 模板的关键行为一致。
- [x] 4.3 修改 explore Skill/Command：移除 QMD 调用，接入 idea list/show、显式和自然语言恢复规则、已有 change 边界及 capture/lite/propose 自然出口。
- [x] 4.4 修改 propose Skill/Command：支持显式一个或多个 `idea:<name>`，把 idea 作为背景，并在 full artifacts 验证后一次性 promote。
- [x] 4.5 修改 lite Skill/Command：支持显式 idea，在 tasks 验证后、实现前 promote，规划失败时保留源 idea。
- [x] 4.6 运行模板 codegen 更新 generated 常量，调整 init/update 的模板数量与内容断言，验证所有 Provider 获得 capture Skill、支持 commandDir 的 Provider 获得 capture Command。

## 5. 文档与整体验证

- [x] 5.1 更新中英文 README，说明 idea 的定位、Git/隐私边界、CLI 命令和 capture → explore → propose/lite 生命周期，并避免把它描述成永久知识库。
- [x] 5.2 运行格式化及 shared、fs、core、CLI、config 的针对性测试和类型检查，修复所有回归。
- [x] 5.3 运行 `pnpm check` 和构建，手工走通创建、列举、读取、受保护更新、从 idea 生成规划并晋升后随 change 归档的端到端样例。
