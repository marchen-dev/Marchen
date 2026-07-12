# skill-cross-references

## 目的

既有 skill 文本中"修订计划"类指引统一指向 `/marchen:update`,消除新 skill 的孤岛效应。

### 需求: apply 与 lite 的暂停指引

`apply` 与 `lite` skill 在暂停条件"发现设计问题"处 MUST 指向 `/marchen:update` 作为修订途径,不再使用无着落的"建议更新 artifact"表述。

#### 场景: apply 过程中发现设计问题

- **GIVEN** AI 正按 tasks.md 实现任务
- **WHEN** 发现 design 与实际情况冲突需要修订计划
- **THEN** skill 文本指引其暂停并建议用户运行 `/marchen:update`

### 需求: propose-preview 的修改入口分叉

`propose-preview` skill 的"下一步"指引 MUST 区分两类修改:变更意图/方向的调整指向 `/marchen:propose`,局部细节修订指向 `/marchen:update`。

#### 场景: 预览后想改细节

- **GIVEN** 用户看完浓缩摘要
- **WHEN** 想调整 design 中某个技术选型但意图不变
- **THEN** skill 文本指引 `/marchen:update <name>` 而非重跑 propose

#### 场景: 预览后推翻方向

- **GIVEN** 用户看完浓缩摘要
- **WHEN** 认为整个变更方向不对
- **THEN** skill 文本指引 `/marchen:propose` 重新提案
