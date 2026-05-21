## 1. 准备与骨架

- [x] 1.1 备份现有 `README.md` 和 `README.en.md` 内容（git diff 可恢复，无需额外文件）
- [x] 1.2 按 design 决策 1 的章节大纲，在两份 README 中搭建空骨架（仅 `##` 标题，无内容）

## 2. 中文版 `README.md` 重写

- [x] 2.1 顶部互链 + 标题 + tagline（"AI 编码工作流工装 — 给编码代理一层工程化外壳。"）+ npm badge
- [x] 2.2 「为什么」章节：引入 harness engineering 概念（一次性解释），点出"工作流工装 + 长期记忆"两根支柱
- [x] 2.3 「快速开始」章节：install + `marchen init` + 几条常用 skill 命令示例
- [x] 2.4 「两根支柱」章节：用表格或左右并列呈现两根支柱概览
- [x] 2.5 「工作流工装」章节：依次介绍 explore / propose / lite / apply / review / archive，每个 skill 一段。`marchen:propose` 段落包含 `proposal → specs → design → tasks` 产物清单
- [x] 2.6 「长期记忆」章节：迁移原"搜索"章节内容，新增"归档 → changelog → search"闭环描述、explore/apply 自动检索说明、模型下载与镜像配置
- [x] 2.7 「支持的 AI 工具」章节：保留现有列表
- [x] 2.8 「CLI 命令」章节：保留现有命令表
- [x] 2.9 「工作区结构」章节：保留现有目录树
- [x] 2.10 「更新」「开发」「致谢」「License」章节：保留现有内容

## 3. 英文版 `README.en.md` 重写

- [x] 3.1 顶部互链 + 标题 + tagline（"Workflow harness for AI coding agents — an engineering shell for your agent."）+ npm badge
- [x] 3.2 「Why」章节：与中文版语义对应，引入 harness engineering 概念
- [x] 3.3 「Quick Start」章节：命令示例与中文版字符级一致，注释翻译
- [x] 3.4 「Two Pillars」章节：结构与中文版对齐
- [x] 3.5 「Workflow Harness」章节：skill 描述与中文版段落一一对应
- [x] 3.6 「Long-term Memory」章节：与中文版内容一一对应
- [x] 3.7 「Supported AI Tools」/「CLI Commands」/「Workspace Layout」/「Updating」/「Development」/「Acknowledgments」/「License」：与中文版同步

## 4. 一致性核对

- [x] 4.1 提取两份 README 的 `##` 标题列表，确认数量与顺序一致（验收 `readme-bilingual-sync` 章节结构对齐需求）
- [x] 4.2 按 design 决策 2 的术语对照表，全文核对中英术语翻译唯一且对应（验收术语翻译口径需求）
- [x] 4.3 全文搜索 `spec-driven` / `规范驱动` / `spec 驱动`，确认无匹配（验收顶层定位措辞需求）
- [x] 4.4 全文搜索 `harness engineering`，确认仅在「为什么 / Why」章节出现一次（验收 harness engineering 引入位置需求）
- [x] 4.5 全文搜索 `proposal` / `specs` / `design` / `tasks`，确认仅出现在 `marchen:propose` 描述、CLI 命令、工作区目录树三处（验收 spec 流程下沉位置需求）
- [x] 4.6 全文搜索 `改名` / `rename` / `新名字` / `new name`，确认均无匹配（验收暂不预告改名需求）
- [x] 4.7 比对两份 README 中的所有 bash 代码块，确认命令字符级一致，仅注释按语言翻译（验收命令示例同步需求）
- [x] 4.8 确认两份 README 第一行包含正确的跨语言互链（验收跨语言互链需求）

## 5. 收尾

- [ ] 5.1 用 `marchen:review reposition-readme-harness` 对照 spec 验收
- [ ] 5.2 本地预览两份 README 的渲染效果（GitHub markdown preview 或 IDE 预览）
- [x] 5.3 提示用户用 `marchen:archive reposition-readme-harness` 归档
