[English](./README.en.md)

# Marchen

AI 编码工作流工装 — 给编码代理一层工程化外壳。

[![npm version](https://img.shields.io/npm/v/marchen)](https://www.npmjs.com/package/marchen)

## 为什么

AI 编码工具（Claude Code、Codex、Cursor 等）已经把"AI 怎么写代码"解决得不错。但真实工程里还有一层缺口：

**AI 怎么思考、怎么留痕、怎么记住自己做过什么。**

没有这层，AI 容易想到哪写到哪、上下文一断就失忆、过去的决策无从回顾。这层缺口被称为 **harness engineering**——给 AI 编码代理搭一层工程化外壳。

Marchen 就是做这件事的，由两根支柱组成：

- **工作流工装**：从想法到实现的每一步都有对应的 skill——探索、提案、实现、验收、归档
- **长期记忆**：每次变更自动留痕归档，通过 changelog 定位历史，让 AI 在下一次工作时恢复相关上下文

## 快速开始

```bash
npm install -g marchen

# 在项目根目录初始化，选择要集成的 AI 编码工具
marchen init
```

`marchen init` 会让你选择要集成的 AI 编码工具，然后为选中的工具生成对应的 skill 文件。初始化后，你可以在支持的工具中直接调用工装：

```bash
marchen:explore 我想给项目加暗色模式   # 先理清想法
marchen:capture                       # 暂存探索状态，以后继续
marchen:lite                          # 轻量一气呵成：创建 → 实现 → 归档
marchen:propose                       # 复杂功能：生成完整方案文档
marchen:apply                         # 按计划逐步实现
marchen:archive                       # 完成后归档留痕
```

## 两根支柱

| 支柱 | 角色 | 核心能力 |
|---|---|---|
| **工作流工装** | 让 AI 的每一步都有结构 | explore / capture / propose / preview / lite / apply / update / acceptance / archive |
| **长期记忆** | 让 AI 跨会话不失忆 | archive 自动留痕 · changelog 索引 · artifact 回读 |

两根支柱协同工作：工作流工装产出结构化 artifact，归档后进入长期记忆；下次启动新变更时，explore / apply 等 skill 先从 changelog 定位候选记录，再读取相关 artifact 恢复上下文。

## 工作流工装

每个 skill 解决工作流中的一个具体环节。`marchen init` 后可在 AI 工具中直接调用：

- **`marchen:explore`** — 探索模式。在动手前理清想法、调查问题、比较方案。不写代码，只思考。
- **`marchen:capture`** — 把尚未准备实施的讨论提炼为 Idea 状态快照，稍后可继续 explore 或晋升；不保存聊天原文。
- **`marchen:propose`** — 提出新变更。引导 AI 产出一套结构化文档：动机（proposal）、需求规格（specs）、技术方案（design）、任务清单（tasks）。适合复杂功能、架构变更。
- **`marchen:propose-preview`** — 把 propose 产出的 4~7 个 artifact 浓缩成一张终端卡片，便于人快速 review，决定下一步是 apply 还是回头改 propose。
- **`marchen:lite`** — 轻量一气呵成。创建 lite 变更 → 实现任务 → 询问归档，全程一条命令。适合 bug 修复、小改动、快速迭代。
- **`marchen:apply`** — 按生成的任务清单逐个实现，完成后勾选 checkbox。
- **`marchen:update`** — 修订变更的已有规划产物（proposal / specs / design / tasks），并双向调和保持彼此一致。只改计划，绝不修改代码。
- **`marchen:acceptance`** — apply 完成后出示本地验收页（截图与结论），等人签核后再归档。
- **`marchen:archive`** — 归档已完成的变更，自动写入 changelog 索引。

尚未准备实施时，可以把探索停放在 `marchen/ideas/<name>.md`：

```text
explore → capture → explore idea:<name> → lite/propose idea:<name>
```

Idea 默认是 Git 可追踪的项目文件，但 Marchen 不会自动执行 Git add 或 commit。Capture 会清理凭据、账号数据和绝对本机路径等明显敏感信息，但无法判断任意业务描述是否属于组织机密；提交前仍需人工 review。晋升后，Idea 会移动到 change 的 `exploration/`，正式 proposal/specs/design/tasks 始终是真相源。

## 长期记忆

每个归档的变更都成为项目的长期记忆——完整保留所有 artifact 文件，并在 `changelog.md` 中留下摘要索引。

```bash
cat marchen/changelog.md
# 根据摘要读取相关目录，例如 marchen/archive/<date>-<change>/design.md
```

长期记忆使用确定性的 archive → changelog → artifact 回读闭环：

1. `marchen:archive` 把变更移入 `marchen/archive/`，并在 `changelog.md` 中追加一行索引
2. `marchen:explore`、`marchen:apply` 先扫描 changelog 摘要，定位少量候选归档
3. AI 按需读取候选归档中的 proposal、design 或 spec，恢复决策上下文

内置 `marchen search`、QMD 和模型下载链路已经退役。升级后请运行 `marchen update`：它会删除废弃的 `search`、`models` 配置，并重新生成所选 AI 工具的 Skill/Command 文件。

`marchen init` 和 `marchen update` 还会在项目根目录幂等补齐 `.gitattributes`，将归档中的单文件验收页标记为生成产物，避免 GitHub 将仓库语言错误识别为 HTML；已有属性规则不会被覆盖。

迁移不会自动删除现有数据：

- `marchen/.search/` 继续被 Git 忽略，确认不再需要后可手动删除。
- `~/.cache/qmd/models/` 可能被独立 QMD 或其他工具共享；只有确认没有其他消费者时才手动清理。

## 支持的 AI 工具

* Claude Code
* Codex
* Cursor
* Windsurf
* GitHub Copilot
* Gemini CLI
* Kiro
* OpenCode
* Kilo Code
* Antigravity

`marchen init` 时可多选，所有工具共享同一份 SKILL.md 内容。

## CLI 命令

```bash
marchen init                              # 初始化目录结构，选择 AI 工具集成
marchen new <name> [--schema full|lite]   # 创建变更
marchen list [--json]                     # 列出所有 open 变更
marchen status <name> [--json]            # 查看 artifact 状态和工作流建议
marchen instructions <name> <artifact>    # 获取 artifact 创建指令（JSON）
marchen archive <name> [--summary <text>] # 归档变更并写入 changelog
marchen update                            # 更新 skill/command 文件到最新版本
marchen idea list [--json]                # 列出尚未晋升的 Idea
marchen idea show <name> [--json]         # 读取完整 Idea 和 revision
marchen idea create <name> --stdin         # 从 stdin 创建 Idea
marchen idea update <name> --if-revision <revision> --stdin
marchen idea promote <names...> --change <change> # 晋升到正式变更
marchen idea remove <name> [--yes]         # 删除未晋升 Idea
```

## 工作区结构

```
marchen/
├── ideas/            # 尚未晋升、可继续探索的 Idea
├── changes/          # 进行中的变更
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       ├── tasks.md
│       └── exploration/ # 晋升后保留的探索背景
├── archive/          # 已归档的变更
├── changelog.md      # 变更日志索引
└── config.yaml       # 配置（含 providers 选择）
```

归档变更时，Marchen 自动在 `changelog.md` 中追加记录，为项目提供结构化的变更历史。

## 更新

升级 marchen 后，运行 update 同步 skill 文件并执行工作区配置迁移：

> 从仍包含 `marchen search` 的版本升级属于 breaking change；升级后旧命令将按未知命令处理。

```bash
npm install -g marchen@latest
marchen update
```

## 开发

pnpm monorepo，Turborepo 编排构建：

```
apps/cli          CLI 入口（commander + @clack/prompts）
packages/core     业务逻辑（Workspace + ChangeManager + IdeaManager）
packages/config   Schema 定义、模板、provider 注册表
packages/fs       文件系统操作封装
packages/shared   共享类型、常量
```

```bash
pnpm install      # 安装依赖
pnpm build        # 构建所有包
pnpm dev          # watch 模式
pnpm test         # 运行测试
pnpm check        # lint + typecheck + test
```

## 致谢

本项目的工作流设计受 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 启发。

## License

MIT
