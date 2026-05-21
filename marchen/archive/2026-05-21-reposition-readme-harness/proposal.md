## 动机

当前 README 把 MarchenSpec 定位为"规范驱动工作流 CLI / Spec-driven workflow CLI"，把 `proposal → specs → design → tasks` 这套流程作为核心卖点反复强调。这个定位有两个问题：

1. **方向已经偏了**。MarchenSpec 真正的价值不止 spec 流程，而是给 AI 编码代理搭一层完整的工程化外壳——包含探索、提案、实现、审查、归档、长期记忆等一整套工装。spec 流程只是其中一种工装。
2. **即将改名**。后续会把名字中的 "spec" 去掉，README 需要先从定位层面跟改名方向对齐，避免"先去标签再改名"两次返工。

新定位是 **harness engineering**——给 AI 编码代理的工作流工装。这个概念上位于 spec 流程之上，能更准确地容纳现有的所有 skill 和能力。

## 变更内容

重写 `README.md` 和 `README.en.md`，使两份文档：

- 标题下方 tagline 改为"AI 编码工作流工装 / Workflow harness for AI coding agents"
- 新增"为什么"章节，**仅在此处一次性**解释 harness engineering 概念
- 用"工作流工装 + 长期记忆"两根支柱组织功能介绍，**不再**用 spec-driven 作为定位词
- 把 `proposal → specs → design → tasks` 流程下沉为 `marchen:propose` 工装的内部细节，不在顶层叙事中展开
- 提升 search / archive / changelog 为核心卖点之一（"长期记忆"支柱）
- 暂不预告改名，仍使用 MarchenSpec 名称
- 保持中英文两份内容、结构、措辞口径完全对齐

不修改 CLI 命令、skill 内容、代码逻辑——本次只动两份 README。

## 能力

### 新增能力

- `readme-positioning` — README 的新定位措辞、叙事框架、章节结构（含 harness engineering 概念的引入规则、两根支柱的组织方式、spec 流程的下沉位置）
- `readme-bilingual-sync` — 中英文 README 的同步规格（结构对齐、措辞口径对应、术语翻译表）

### 修改能力

无（本次为文档重写，不涉及现有 capability 行为变更）

## 影响范围

- `README.md`（中文版，整体重写）
- `README.en.md`（英文版，整体重写）
- 不涉及代码、CLI、skill、模板、测试
- 间接影响：npm 包页面、GitHub 仓库首页展示的项目定位描述
