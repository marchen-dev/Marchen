## 目的

`marchen-propose` skill 与 command 在所有 artifact 生成完成后，向用户提示两个并列的下一步选项：直接 apply 或先 preview。

### 需求: 完成时提示两个选项

系统 MUST 在 propose 流程末尾的"输出"段落中，同时呈现 `/marchen:apply` 和 `/marchen:propose-preview` 两个可选下一步命令。

#### 场景: propose 全部完成

- **GIVEN** 所有 artifact（proposal / specs / design / tasks）已成功生成
- **WHEN** propose skill 走到最终输出阶段
- **THEN** 显示文案 MUST 包含两条可选指令：
  - `/marchen:apply <name>` 用于直接实现
  - `/marchen:propose-preview <name>` 用于先查看浓缩摘要
- **AND** 两条指令以平行的形式呈现，不暗示顺序

### 需求: 纯文字提示，不主动触发

系统 MUST 仅以文字方式提示下一步选项，不调用 AskUserQuestion 或其他交互工具询问用户选择，更不自动执行 `/marchen:propose-preview`。

#### 场景: AI 不自动执行 preview

- **GIVEN** propose 完成
- **WHEN** AI 输出末尾提示
- **THEN** AI MUST NOT 调用 AskUserQuestion 让用户在 apply / preview 之间二选一
- **AND** AI MUST NOT 自动执行 `/marchen:propose-preview`
- **AND** AI 只输出文字提示，由用户自行决定下一条命令

### 需求: skill 与 command 模板一致

系统 MUST 在 `marchen-propose` 对应的 skill 模板和 command 模板中，使用语义等价的完成提示文案。

#### 场景: 模板对齐

- **GIVEN** skills/propose.md 末尾文案被更新
- **WHEN** 检查 commands/propose.md
- **THEN** commands/propose.md 末尾的对应文案 MUST 包含相同的两个下一步选项
- **AND** 仅在入口与措辞细节（skill vs command 命名）上允许差异
