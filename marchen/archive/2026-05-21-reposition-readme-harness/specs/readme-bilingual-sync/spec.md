## 目的

定义中文 `README.md` 与英文 `README.en.md` 之间的同步规格，确保两份文档的章节结构、内容范围、术语口径完全对齐，避免出现单语独有内容或翻译失真。

### 需求: 章节结构对齐

`README.md` 与 `README.en.md` MUST 拥有完全一致的顶层章节（`##` 标题）数量、顺序与对应关系。

#### 场景: 比对两份 README 的章节大纲

- **GIVEN** 重写后的 `README.md` 和 `README.en.md`
- **WHEN** 提取两份文件的所有 `##` 标题列表
- **THEN** 两份列表的长度相同
- **AND** 第 N 个中文标题与第 N 个英文标题在语义上一一对应（例如"为什么"对应 "Why"、"两根支柱"对应 "Two Pillars"）

### 需求: 关键术语翻译口径

跨两份 README 的核心术语 MUST 遵循统一的翻译对照表，且每个术语在各自语言版本中保持唯一译法。

#### 场景: 核对术语翻译

- **GIVEN** 重写后的两份 README
- **WHEN** 检查以下术语对照
- **THEN** 翻译关系满足：
  - "工作流工装" ↔ "workflow harness"
  - "长期记忆" ↔ "long-term memory"
  - "工装" ↔ "harness"（单独使用时）
  - "AI 编码代理" ↔ "AI coding agent"
  - "归档" ↔ "archive"
  - "变更" ↔ "change"
- **AND** 同一术语在同一语言版本内不出现多种译法

### 需求: tagline 对应关系

两份 README 的 tagline MUST 在各自语言下表达相同的产品定位，且不互为字面直译。

#### 场景: 比对 tagline

- **GIVEN** 重写后的两份 README
- **WHEN** 读取标题下方第一行 tagline
- **THEN** 中文版为"AI 编码工作流工装"或语义等价的精炼短语
- **AND** 英文版为 "Workflow harness for AI coding agents" 或语义等价的精炼短语
- **AND** 两者传达"给 AI 代理搭工程化外壳"的相同核心定位

### 需求: 命令示例与代码块同步

CLI 命令示例、bash 代码块、目录树等非自然语言内容 MUST 在两份 README 中保持字符级别一致（除注释外）。

#### 场景: 比对 bash 代码块

- **GIVEN** 两份 README 中的同一个 bash 代码块（例如快速开始、CLI 命令列表）
- **WHEN** 提取代码块内的命令行
- **THEN** 命令本身（marchen 子命令、参数、flag）完全一致
- **AND** 仅注释（`#` 后的内容）按语言翻译，命令不翻译

### 需求: 跨语言互链

两份 README 顶部 MUST 包含指向另一份的链接，方便读者在中英文版本间切换。

#### 场景: 检查顶部互链

- **GIVEN** 重写后的两份 README
- **WHEN** 读取文件第一行
- **THEN** `README.md` 第一行包含 `[English](./README.en.md)` 链接
- **AND** `README.en.md` 第一行包含 `[中文](./README.md)` 链接
