## 背景

Marchen 目前以 `Workspace` 提供路径上下文，以各领域 Manager 承担业务逻辑，以 `apps/cli` 作为薄 UI，并通过 config 模板向多个 AI Provider 分发 Skill。正式 change 使用独立目录和 `.metadata.yaml`，但尚未进入 change 的讨论没有领域模型，只能停留在对话或由 Skill 直接写任意文档。

本变更引入的 idea 是“未晋升的探索状态”，不是新的知识库，也不是另一套永久规范。过去的 knowledge 目录因重复和失效风险被移除，因此 idea 必须保持范围收敛：只保存待继续或待晋升的主题；一旦进入 change 就移出停车区，最终随整个 change 归档。

当前项目已有 QMD 搜索，但用户已明确 idea 恢复不应依赖它，且 QMD 后续准备单独退役。自然语言匹配由 AI 基于轻量元数据完成，CLI 只提供确定性数据接口。

## 目标与非目标

**目标：**

- 为 `marchen/ideas/*.md` 建立稳定、可手动阅读的文档契约。
- 让 CLI/Core 负责校验、读写、修订保护、删除和晋升，避免 Skill 自行拼路径和覆盖文件。
- 让 Capture 保存提炼后的探索状态，并让 Explore 在后续对话中恢复合适的 idea。
- 让 Propose/Lite 从显式 idea 生成正式规划，并在规划就绪后可靠迁移探索背景。
- 保持包的单向依赖和“CLI 只做 UI、文件操作走 fs”的现有架构。

**非目标：**

- 不保存或索引原始聊天记录。
- 不构建通用知识库、路线图或永久事实系统。
- 不在 CLI 内调用模型、生成摘要或判断语义相关性。
- 不实现 QMD、embedding、向量索引或 idea 数值评分。
- 不在本变更中删除 `marchen search`、QMD 依赖或其他 Skill 的历史搜索能力。
- 不自动执行 Git add、commit、push，也不保证识别所有业务机密。
- 不让 idea 替代 proposal、specs、design 或 tasks。

## 决策

### 1. 使用 IdeaManager 作为单一领域入口

新增 `IdeaManager`，由 `Workspace` 提供 `ideaDir`，CLI context 同时构造 `ChangeManager` 与 `IdeaManager`。CLI 命令只处理 Commander 参数、stdin、交互确认和人类/JSON 输出；名称校验、文档解析、冲突检测、修订比较和晋升均位于 Core。

IdeaManager 通过 `@marchen/fs` 完成所有文件操作。共享包只承载 `IdeaMetadata`、`IdeaSummary`、`IdeaDocument`、列表问题、命令结果等无业务依赖类型，以及 ideas 目录和格式版本常量。

选择独立 Manager 而不是把 idea 塞进 ChangeManager，因为 idea 在晋升前不是 change，没有 schema、artifact 或 change 状态。晋升时 IdeaManager 调用 ChangeManager 的状态查询验证目标规划已就绪，避免复制 artifact 状态规则。

### 2. 单文件 Markdown + 小型 YAML frontmatter

每个 idea 使用一个 `marchen/ideas/<name>.md` 文件：

```md
---
format: 1
title: 验收阶段 UI 重构
summary: 优化验收项、证据预览和检查器的关系
tags:
  - acceptance
  - ui
createdAt: 2026-08-29T10:00:00.000Z
updatedAt: 2026-08-29T11:00:00.000Z
---

> 本文记录尚未定案的探索背景；晋升后以正式变更产物为准。

## 背景
...
```

名称从文件名派生，不在 frontmatter 重复存储，避免重命名后两处不一致。`format` 为整数版本，便于未来识别不兼容格式。CLI 管理 format、createdAt、updatedAt；Skill 提供 title、summary、tags 与正文。

CLI 从 stdin 接受一份完整的候选 Markdown。创建时覆盖或补齐 CLI 管理字段；更新时保留原 createdAt、刷新 updatedAt。Core 只强校验元数据类型、标题/摘要非空和正文非空，不强制正文必须包含每一个推荐章节，以保留手工编辑能力。

选择 frontmatter 而不是每个 idea 一个目录加 `.metadata.yaml`，因为用户已确定 `<name>.md` 单文件形态，单文件也更便于浏览、提交和迁移。YAML 文本解析能力复用或扩展 fs 包现有的 YAML 封装，不在 CLI 重复解析。

### 3. JSON API 使用可扩展对象而不是裸数组

`marchen idea list --json` 返回：

```json
{
  "ideas": [
    {
      "name": "acceptance-ui",
      "title": "验收阶段 UI 重构",
      "summary": "优化验收项、证据预览和检查器的关系",
      "tags": ["acceptance", "ui"],
      "updatedAt": "2026-08-29T11:00:00.000Z"
    }
  ],
  "issues": []
}
```

列表逐文件解析。单个文件损坏、格式版本未知或字段非法时，加入 issues 并继续返回其他有效 idea。`show --json` 针对单个文件严格失败，并返回 metadata、body、完整规范化 Markdown 和 revision，供 Skill 更新时使用。

所有 mutation 命令提供 `--json`，成功结果写 stdout；错误沿用现有统一错误处理并以非零状态退出，避免 Skill 从装饰性终端文本猜测结果。

### 4. 用内容 revision 做乐观更新保护

revision 为规范化文件完整 UTF-8 内容的 SHA-256。`show` 返回 revision，`update` 强制要求 `--if-revision <value>`。IdeaManager 在写入前重新读取并计算 revision；不一致时抛出状态错误，要求重新读取和调和。

这能阻止常见的“AI 读取旧内容，稍后覆盖人工或另一任务的新内容”。它不是跨进程数据库事务：两个进程在极短窗口内同时比较后仍可能竞争。第一版不引入容易残留的锁文件；使用相邻临时文件加 rename 降低半写文件风险，并在风险章节明确该边界。

创建必须使用排他写入语义，不能采用“先 exists 后普通覆盖写”作为唯一保护。更新写入采用同目录临时文件与替换，临时文件名不得包含用户可控路径片段之外的未校验内容，失败后清理临时文件。

### 5. `marchen idea` 命令面保持资源化

第一版命令为：

```bash
marchen idea list [--json]
marchen idea show <name> [--json]
marchen idea create <name> --stdin [--json]
marchen idea update <name> --if-revision <revision> --stdin [--json]
marchen idea promote <names...> --change <change> [--json]
marchen idea remove <name> [--yes] [--json]
```

create/update 只接受 stdin 作为正文入口，避免长 Markdown 进入 shell 参数及其转义问题。`--stdin` 也明确了命令会等待输入，防止交互终端误挂起。remove 默认走确认提示；非 TTY 或 Skill 已获得明确确认时必须显式传 `--yes`。

不增加 `idea search`。Explore 先读取轻量 list，再由 AI 判断语义；显式 `idea:<name>` 直接 show。第一版以 idea 池规模较小为假设，如果未来元数据列表明显挤占上下文，再增加普通标签或关键词预筛，而不是提前引入检索引擎。

### 6. Promote 表示生命周期晋升而不是普通附件复制

命令使用 `promote` 而不是 `attach`，强调源 idea 会离开 `marchen/ideas/`。目标路径固定为 `marchen/changes/<change>/exploration/<idea-name>.md`。

晋升前完成全量预检查：

1. 所有 idea 名称合法、互不重复且源文件可读。
2. 目标 change 存在且为 open。
3. ChangeManager 状态显示该 schema 的规划 artifact 已全部 filled；full 需要 proposal/specs/design/tasks，lite 需要 tasks。task checkbox 是否完成不影响规划就绪。
4. 所有目标路径均不存在，避免覆盖既有探索记录。

预检查全部通过后，逐个使用同一文件系统内的 rename 移动文件。若中途失败，按相反顺序尝试把已移动文件回滚到原路径；错误结果必须区分原始失败和回滚失败，不能把部分成功报告为成功。文件系统不提供真正的多文件事务，因此这是“预检 + 最佳努力回滚”，不是绝对原子提交。

ArchiveManager 无需新增 idea 逻辑：`exploration/` 位于 change 内，现有整目录归档会自然携带它。一个 idea 要进入多个 change 时，先由 Capture/Explore 拆分成独立子 idea；多个 idea 进入一个 change 则由 variadic promote 一次处理。

### 7. 初始化和升级都准备 ideas 目录

新工作区在 `marchen init` 时创建 `marchen/ideas/.gitkeep`。已有工作区运行 `marchen update` 时也确保该目录存在，以便升级模板后立即使用；即使目录缺失，IdeaManager.create 仍会安全创建父目录。

目录不写入 `.gitignore`。Marchen 只创建工作区文件，不改变暂存区或提交历史。

### 8. Skill 负责理解，CLI 负责事实操作

新增 capture Skill/Command 模板，并同步修改 explore、propose、lite 两套模板源文件后运行 codegen，禁止直接编辑 generated 文件。

- Capture：从当前对话生成结构化状态快照；清理凭据、账号数据和绝对本机路径；通过 list/show 判断创建还是更新；更新必须带 revision；不自动 Git 操作。
- Explore：移除对项目 QMD 搜索的依赖；保留 changelog + archive 的手动历史检查；支持显式 `idea:<name>`，自然语言场景只读轻量元数据并由 AI 判断；唯一匹配可自动加载但必须公告，多候选让用户选，空输入列最近 idea 和新主题入口。
- Propose：支持显式一个或多个 `idea:<name>`；先 show 作为上下文，完成所有 full artifacts 并验证，再一次 promote；不做隐式语义消费。
- Lite：支持显式 idea；生成并验证 tasks 后、实现前 promote；若规划失败则源 idea 不动。
- 已有 change 中的探索优先更新正式 artifact，只有明确的独立旁支才 capture 新 idea。

Explore 在自然停顿点按成熟度提示 `/marchen:capture`、`/marchen:lite` 或 `/marchen:propose`，但不直接执行另一个 Skill。晋升后的 exploration 保持原样，后续需求变化只更新正式 artifact。

### 9. 隐私采取分层且不做虚假保证

Skill 能看到当前对话语义，因此承担主要清理责任：不保存原始聊天记录，移除 Secret、Cookie、账号信息、个人绝对路径等明显敏感内容。CLI 负责路径安全、名称校验和文件边界，但不尝试用正则判断任意自然语言是否属于公司机密，因为这种检测误报与漏报都不可控。

文档和 Skill 必须明确：idea 是可进入 Git 的项目文件，用户在提交前仍应 review。CLI 不提供 `--allow-sensitive` 一类容易被误解为安全认证的开关。

## 风险与权衡

- **元数据列表随 idea 数量增长**：不使用搜索意味着 Explore 需要读取全部轻量元数据。第一版接受小规模停车区假设；生命周期晋升会持续减少未处理 idea。达到数百条后再评估关键词/标签预筛。
- **revision 不是严格跨进程事务**：乐观比较可以防止绝大多数陈旧覆盖，但无法完全消除两个进程同时通过比较的竞态。引入锁文件会带来崩溃残留和恢复策略，第一版不采用。
- **多文件晋升无法绝对原子**：rename 对单文件可靠，但批量只能通过全量预检与最佳努力回滚降低部分成功风险。错误必须暴露实际状态，供用户修复。
- **手工编辑可能破坏 frontmatter**：list 对坏文件降级并报告 issues，show/update 对目标文件严格报错；CLI 不自动猜测修复，避免丢失内容。
- **可提交带来隐私责任**：默认 Git 可追踪有利于跨会话与协作，但也意味着 Capture 清理和提交前 review 很重要。CLI 只能防路径越界和明显结构错误，不能判断组织保密等级。
- **Skill/Command 模板重复**：当前只有部分 Provider 使用 commandDir，两套模板需要保持行为一致。测试应覆盖模板中的关键命令和护栏，codegen 作为唯一 generated 更新路径。
- **QMD 处于过渡状态**：本变更只让 idea/Explore 新路径不依赖 QMD，不删除现有 SearchManager 或 search CLI，避免功能开发与依赖退役耦合。
