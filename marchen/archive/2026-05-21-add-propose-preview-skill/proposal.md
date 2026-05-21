## 动机

`/marchen:propose` 完成后会产出 proposal/design/specs/tasks 共 4~7 个 markdown 文件，单个 full 变更总行数普遍在 230~340 行。人 review 时需要跨多个文件来回跳转，且各 artifact 之间有内容重复（动机、决策、能力被叙述多次），review 体验沉重。

需要一个轻量的"人类视角"摘要——在不破坏 artifact 完整性的前提下，把关键信息浓缩成一张终端可视的卡片，让用户在 review 完整 artifact 之前先快速判断方向是否对。

## 变更内容

新增一个 skill `marchen-propose-preview`，通过 `/marchen:propose-preview <name>` 显式调用：

- 调用 `marchen instructions <name> apply --json` 获取所有 artifact 内容
- 按 schema（full / lite）选不同模板生成浓缩卡片，直接打印到终端
- 不写文件、不调用 LLM API，全部在主会话内执行
- frontmatter 设 `disable-model-invocation: true`，阻止 Claude 自动触发，必须用户显式 `/` 调用

同时修改 `marchen-propose` skill（及配套 command）的末尾文案，在 propose 完成后用纯文字提示用户两个可选下一步：直接 apply 或先 preview。

不破坏现有 artifact 结构、不改 CLI 命令、不动 codegen 流程——纯 skill/command 模板层的扩展。

## 能力

### 新增能力

- `propose-preview-skill`: 新 skill `marchen-propose-preview` 本体，包括 frontmatter（含 `disable-model-invocation`、`argument-hint`）、流程步骤、full/lite 两套摘要规则、卡片输出样例和护栏
- `propose-completion-hint`: `marchen-propose` skill/command 末尾的完成提示文案，新增 `/marchen:propose-preview` 作为可选下一步

### 修改能力

（无）

## 影响范围

- `packages/config/templates/skills/` — 新增 `propose-preview.md`，修改 `propose.md` 末尾提示
- `packages/config/templates/commands/` — 新增 `propose-preview.md`，修改 `propose.md` 末尾提示
- `packages/config/src/generated/` — codegen 重跑后产物变化（skill-templates.ts、command-templates.ts）
- `packages/config/scripts/generate-templates.ts` — 无需改动（已支持遍历 templates 目录）
- 无 CLI 代码改动、无 core 代码改动、无新增依赖
