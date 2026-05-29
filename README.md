[English](./README.en.md)

# Marchen

AI 编码工作流工装 — 给编码代理一层工程化外壳。

[![npm version](https://img.shields.io/npm/v/marchen)](https://www.npmjs.com/package/marchen)

## 为什么

AI 编码工具（Claude Code、Codex、Cursor 等）已经把"AI 怎么写代码"解决得不错。但真实工程里还有一层缺口：

**AI 怎么思考、怎么留痕、怎么记住自己做过什么。**

没有这层，AI 容易想到哪写到哪、上下文一断就失忆、过去的决策无从回顾。这层缺口被称为 **harness engineering**——给 AI 编码代理搭一层工程化外壳。

Marchen 就是做这件事的，由两根支柱组成：

- **工作流工装**：从想法到实现的每一步都有对应的 skill——探索、提案、实现、审查、归档
- **长期记忆**：每次变更自动留痕归档，可被语义检索，让 AI 在下一次工作时调出相关上下文

## 快速开始

```bash
npm install -g marchen

# 在项目根目录初始化，选择要集成的 AI 编码工具
marchen init
```

`marchen init` 会让你选择要集成的 AI 编码工具，然后为选中的工具生成对应的 skill 文件。初始化后，你可以在支持的工具中直接调用工装：

```bash
marchen:explore 我想给项目加暗色模式   # 先理清想法
marchen:lite                          # 轻量一气呵成：创建 → 实现 → 归档
marchen:propose                       # 复杂功能：生成完整方案文档
marchen:apply                         # 按计划逐步实现
marchen:archive                       # 完成后归档留痕
```

## 两根支柱

| 支柱 | 角色 | 核心能力 |
|---|---|---|
| **工作流工装** | 让 AI 的每一步都有结构 | explore / propose / preview / lite / apply / review / archive |
| **长期记忆** | 让 AI 跨会话不失忆 | archive 自动留痕 · changelog 索引 · search 语义检索 |

两根支柱协同工作：工作流工装产出结构化 artifact，归档后进入长期记忆；下次启动新变更时，explore / apply 等 skill 自动从记忆中检索相关历史作为上下文。

## 工作流工装

每个 skill 解决工作流中的一个具体环节。`marchen init` 后可在 AI 工具中直接调用：

- **`marchen:explore`** — 探索模式。在动手前理清想法、调查问题、比较方案。不写代码，只思考。
- **`marchen:propose`** — 提出新变更。引导 AI 产出一套结构化文档：动机（proposal）、需求规格（specs）、技术方案（design）、任务清单（tasks）。适合复杂功能、架构变更。
- **`marchen:propose-preview`** — 把 propose 产出的 4~7 个 artifact 浓缩成一张终端卡片，便于人快速 review，决定下一步是 apply 还是回头改 propose。
- **`marchen:lite`** — 轻量一气呵成。创建 lite 变更 → 实现任务 → 询问归档，全程一条命令。适合 bug 修复、小改动、快速迭代。
- **`marchen:apply`** — 按生成的任务清单逐个实现，完成后勾选 checkbox。
- **`marchen:review`** — 对照变更意图检查代码实现的完整性和一致性，支持基于 chrome-devtools MCP 的 UI 场景验证。
- **`marchen:archive`** — 归档已完成的变更，自动写入 changelog 索引。

## 长期记忆

每个归档的变更都成为项目的长期记忆——完整保留所有 artifact 文件，并被索引以便后续检索。

```bash
marchen search "用户认证"              # 语义搜索归档历史
marchen search "重构" -n 10            # 指定结果数量
marchen search "认证" --min-score 0.5  # 设置最低分数阈值
marchen search "认证" --rebuild        # 重建索引后搜索
```

内置 Hybrid Search（BM25 + 向量检索 + 重排序），可以从归档历史中检索相关的设计决策和变更记录。归档 → changelog → search 构成完整闭环：

1. `marchen:archive` 把变更移入 `marchen/archive/`，并在 `changelog.md` 中追加一行索引
2. `marchen search` 在归档内容上做语义检索
3. `marchen:explore` 和 `marchen:apply` 在工作流中自动调用 search，把相关历史作为上下文喂给 AI

首次初始化时可选择启用搜索，启用后会下载所需模型（约 2GB）。未启用搜索时，skill 会自动回退到读取 `changelog.md` 获取历史上下文。

模型默认从国内镜像 `https://hf-mirror.com` 下载，缓存于 `~/.cache/qmd/models/`。需要切换下载源时有两种方式：

- 临时切换：`HF_ENDPOINT=https://huggingface.co marchen update`
- 持久化：编辑 `marchen/config.yaml`，修改 `models.endpoint` 字段

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
marchen search <query> [--rebuild]        # 搜索归档变更历史
```

## 工作区结构

```
marchen/
├── changes/          # 进行中的变更
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       └── tasks.md
├── archive/          # 已归档的变更
├── changelog.md      # 变更日志索引
└── config.yaml       # 配置（含 providers 选择）
```

归档变更时，Marchen 自动在 `changelog.md` 中追加记录，为项目提供结构化的变更历史。

## 更新

升级 marchen 后，运行 update 同步 skill 文件：

```bash
npm install -g marchen@latest
marchen update
```

## 开发

pnpm monorepo，Turborepo 编排构建：

```
apps/cli          CLI 入口（commander + @clack/prompts）
packages/core     业务逻辑（Workspace + ChangeManager）
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
