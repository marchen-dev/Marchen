## 目的

定义 README 的新定位措辞、叙事框架与章节结构，确保读者能在 30 秒内理解 MarchenSpec 是"给 AI 编码代理搭工作流外壳"的工具，而非"规范驱动 CLI"。

### 需求: 顶层定位措辞

README 顶部 tagline MUST 使用"AI 编码工作流工装"（中文版）/"Workflow harness for AI coding agents"（英文版），且不出现 "spec-driven" / "规范驱动" / "spec 驱动" 字样。

#### 场景: 读取 README 顶部

- **GIVEN** 用户打开 `README.md` 或 `README.en.md`
- **WHEN** 阅读项目标题下方的第一行 tagline
- **THEN** 看到的措辞为"AI 编码工作流工装"或"Workflow harness for AI coding agents"
- **AND** 全文搜索 "spec-driven"、"规范驱动"、"spec 驱动" 均无匹配

### 需求: harness engineering 概念的引入位置

README MUST 仅在"为什么"章节一次性解释 harness engineering 概念，其他章节不重复定义、不再次出现该术语作为定位语句。

#### 场景: 全文统计 harness engineering 出现位置

- **GIVEN** 重写后的 README
- **WHEN** 搜索 "harness engineering" 字样
- **THEN** 仅在"为什么 / Why"章节内出现一次解释性段落
- **AND** 其他章节（快速开始、工装速查、长期记忆、CLI 命令等）不再出现该术语

### 需求: 两根支柱叙事结构

README MUST 用"工作流工装"与"长期记忆"两根支柱组织功能介绍，且在"为什么"之后、CLI 命令之前的章节中明确呈现这两根支柱的并列关系。

#### 场景: 浏览功能介绍章节

- **GIVEN** 读完"为什么"章节
- **WHEN** 继续向下阅读
- **THEN** 看到一个章节同时介绍"工作流工装（explore/propose/lite/apply/review/archive）"和"长期记忆（search/archive/changelog）"
- **AND** 两根支柱以并列方式呈现（小标题、表格、或左右对照），不出现"长期记忆是工作流工装的辅助"等从属表述

### 需求: spec 流程的下沉位置

`proposal → specs → design → tasks` 流程 MUST 仅作为 `marchen:propose` 工装的内部产物列表出现，不在顶层"为什么"或"两根支柱"章节展开介绍。

#### 场景: 查找 proposal/specs/design/tasks 文件名

- **GIVEN** 重写后的 README
- **WHEN** 搜索 "proposal"、"specs"、"design"、"tasks" 这四个 artifact 名称
- **THEN** 它们仅出现在 `marchen:propose` 工装的描述段落、CLI 命令示例、以及"工作区结构"目录树中
- **AND** 不出现在 tagline、"为什么"章节、或两根支柱的并列介绍中

### 需求: 长期记忆作为核心卖点

README MUST 把 search / archive / changelog 提升为与工作流工装并列的核心卖点，不再作为附属功能章节出现在末尾。

#### 场景: 评估长期记忆章节的层级

- **GIVEN** 重写后的 README 章节大纲
- **WHEN** 比较"工作流工装"和"长期记忆"两个章节
- **THEN** 二者具有相同的标题层级（同为 `##`）
- **AND** "长期记忆"章节出现在主功能介绍区域，而非"开发"、"致谢"之前的边缘位置

### 需求: 暂不预告改名

README MUST 继续使用 "MarchenSpec" 名称，且不出现"即将改名"、"renaming soon"、"new name coming" 等预告性表述。

#### 场景: 全文搜索改名提示

- **GIVEN** 重写后的 README
- **WHEN** 搜索"改名"、"rename"、"新名字"、"new name" 等字样
- **THEN** 均无匹配
- **AND** 项目名称统一为 "MarchenSpec"
