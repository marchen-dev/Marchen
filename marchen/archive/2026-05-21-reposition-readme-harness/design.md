## 背景

当前 `README.md` / `README.en.md` 围绕"规范驱动工作流 CLI"组织，结构为：

1. 标题 + tagline（spec-driven 定位）
2. 为什么需要它（四步 artifact 流程）
3. 快速开始
4. 支持的 AI 工具
5. 两种 Schema（full / lite 对照）
6. CLI 命令
7. 搜索（独立章节，作为附属功能）
8. 更新 / 工作区结构 / 开发 / 致谢 / License

问题在于：tagline 把"spec"作为核心词，"为什么"用四步流程占满，搜索/归档被边缘化为单独的小章节。这与新定位"给 AI 编码代理的工作流工装 + 长期记忆"不匹配。

## 目标与非目标

**目标：**

- 重写后的两份 README 顶层叙事围绕"工作流工装 + 长期记忆"两根支柱
- harness engineering 概念仅在"为什么"章节出现一次，避免术语满天飞
- spec 流程从顶层下沉到 `marchen:propose` 工装的产物描述中
- 中英文版本结构、术语、命令示例严格对齐
- 现有功能信息密度不下降（不删 CLI 命令表、不删工作区结构图、不删开发章节）

**非目标：**

- 不改名（仍用 MarchenSpec）
- 不预告改名（READ 中不出现"即将改名"提示）
- 不修改任何代码、skill 模板、CLI 行为
- 不新增功能介绍（只重组现有内容）
- 不引入第三种语言版本

## 决策

### 决策 1：章节大纲（中英对照）

| 中文版 (`README.md`) | 英文版 (`README.en.md`) |
|---|---|
| `## 为什么` | `## Why` |
| `## 快速开始` | `## Quick Start` |
| `## 两根支柱` | `## Two Pillars` |
| `## 工作流工装` | `## Workflow Harness` |
| `## 长期记忆` | `## Long-term Memory` |
| `## 支持的 AI 工具` | `## Supported AI Tools` |
| `## CLI 命令` | `## CLI Commands` |
| `## 工作区结构` | `## Workspace Layout` |
| `## 更新` | `## Updating` |
| `## 开发` | `## Development` |
| `## 致谢` | `## Acknowledgments` |
| `## License` | `## License` |

**理由：** "两根支柱"作为概览章节，随后"工作流工装"和"长期记忆"两个 `##` 同级章节分别展开。这样既有总览视图又有详细内容，且二者层级平等。

### 决策 2：术语翻译对照表（写入 design，供 review 时核对）

| 中文 | 英文 |
|---|---|
| 工作流工装 | workflow harness |
| 工装 | harness |
| 长期记忆 | long-term memory |
| AI 编码代理 | AI coding agent |
| 工程化外壳 | engineering shell |
| 归档 | archive |
| 变更 | change |
| 留痕 | leave a trail / artifact trail |
| 探索 / 提案 / 实现 / 审查 / 归档 | explore / propose / apply / review / archive |

**理由：** 术语统一在 design 中固化，避免重写过程中同一概念出现多种译法。

### 决策 3：harness engineering 引入方式

仅在"为什么 / Why"章节用一段话引入：

> 中文：『这层缺口被称为 **harness engineering**——给 AI 代理搭一层工程化外壳。』
> 英文：『This gap is called **harness engineering** — building an engineering shell around AI agents.』

其他章节用"工作流工装 / workflow harness"作为常用词，不再重复 "harness engineering" 完整术语。

**理由：** 既给出概念锚点，又避免术语反复出现造成阅读负担。符合 `readme-positioning` 中"仅在为什么章节一次性解释"的需求。

### 决策 4：spec 流程的下沉位置

`proposal → specs → design → tasks` 只出现在两处：

1. 「工作流工装」章节内 `marchen:propose` 的描述段落（作为产物清单）
2. 「工作区结构」章节的目录树（作为实际文件结构）

**理由：** 与 `readme-positioning` 需求"spec 流程的下沉位置"对齐。CLI 命令表中 `marchen new --schema` 仍保留 full/lite 选项，但不再单独开"两种 Schema"章节解释。

### 决策 5：删除"两种 Schema"独立章节

将 full vs lite 的对照表从 README 移除，仅在 `marchen:propose` 和 `marchen:lite` 的工装描述中分别说明各自适用场景。

**理由：** "两种 Schema"章节本质是 spec-driven 思维的产物（把流程作为顶层卖点）。新定位下，schema 选择是工装内部细节，不应占顶层章节。

### 决策 6：长期记忆章节扩写方向

原"搜索"章节内容（Hybrid Search、命令示例、模型下载）整体迁移并扩展到"长期记忆"章节，新增：

- 强调"归档自动写入 changelog → search 可检索"的闭环
- 说明 explore / apply skill 如何自动利用 search 拉历史上下文

**理由：** 与 `readme-positioning` 中"长期记忆作为核心卖点"对齐，把孤立的搜索功能升级为完整的记忆系统叙事。

### 决策 7：互链与 tagline 位置

两份 README 第一行保留跨语言互链（现有 `[English](./README.en.md)` / `[中文](./README.md)` 不变）。tagline 紧跟标题：

```
# MarchenSpec

AI 编码工作流工装 — 给编码代理一层工程化外壳。
```

```
# MarchenSpec

Workflow harness for AI coding agents — an engineering shell for your agent.
```

**理由：** 跨语言互链是已有规范，无需改动。tagline 在标题正下方而非 npm badge 之后，确保读者第一眼看到定位语句。

## 风险与权衡

### 风险 1：现有用户对 "spec-driven" 定位有认知锚定

部分早期用户可能搜索 "spec-driven CLI" 或通过相关关键词找到本项目。新版完全去掉该词后，搜索引擎索引可能短期下降。

**缓解：** 在 GitHub Topics 中保留 `spec-driven-development` 等标签（不在 README 改动范围内，但可在归档完成后手动同步）；changelog 中明确记录这次定位调整，便于用户理解。

### 风险 2：harness engineering 术语在中文圈陌生

"harness"在中文 AI 开发圈尚未形成统一译法。本设计选用"工装"作为对应词，但读者可能不熟悉。

**缓解：** 在"为什么"章节同时给出中英文术语 + 一句解释；其余地方用"工作流工装"完整词组而非裸"工装"，降低理解成本。

### 风险 3：删除"两种 Schema"章节后，lite/full 区别更难发现

原章节用对照表清晰呈现两者差异。下沉到工装描述后，需要读者分别阅读 `marchen:propose` 和 `marchen:lite` 描述才能完整理解差异。

**权衡：** 接受这个理解成本上升。原因：新定位下，schema 选择属于"用哪个工装"的实操问题，而非项目核心定位。完整对照可放到未来的进阶文档。

### 风险 4：中英版本同步维护成本

`readme-bilingual-sync` 要求章节结构、术语、命令示例严格对齐。后续每次 README 改动都需要同步两边，比单语版本维护成本高。

**权衡：** 接受。MarchenSpec 当前用户群跨中英，单语会显著降低可达性。本变更已通过术语对照表固化翻译口径，降低后续同步成本。
