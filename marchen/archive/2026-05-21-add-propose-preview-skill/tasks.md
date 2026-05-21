## 1. 新增 propose-preview skill 模板

- [x] 1.1 新建 `packages/config/templates/skills/propose-preview.md`，包含 frontmatter（`name` / `description` / `disable-model-invocation: true` / `argument-hint: <change-name>`）、概述段、流程步骤（选择变更 / 获取 apply --json / 按 schema 生成卡片 / 末尾下一步提示）、摘要规则（full 四段上限表 + lite 两段上限表 + 影响图退化策略 + 进度条规则）、full 与 lite 两份输出样例、护栏
- [x] 1.2 SKILL.md body 严禁包含 `allowed-tools` 字段

## 2. 新增 propose-preview command 模板

- [x] 2.1 新建 `packages/config/templates/commands/propose-preview.md`，与 skill 模板等价的全主会话流程；frontmatter 按 commands 目录现有风格保留必要字段（参照现有 `commands/propose.md`）
- [x] 2.2 diff 校对 skill 与 command 两份模板，确认非入口差异之外的流程内容、摘要规则、样例、护栏完全一致

## 3. 修改 propose skill/command 末尾提示

- [x] 3.1 修改 `packages/config/templates/skills/propose.md` 的"输出"段落，在原有 `/marchen:apply` 提示后追加 `/marchen:propose-preview <name>` 作为并列可选下一步，明确"先看摘要再决定"语义
- [x] 3.2 修改 `packages/config/templates/commands/propose.md` 中对应文案，与 skill 版保持语义等价
- [x] 3.3 grep 确认两份模板均不调用 AskUserQuestion 询问"apply 还是 preview"，保持纯文字提示

## 4. 重新生成 codegen 产物

- [x] 4.1 执行 `pnpm --filter @marchen-spec/config generate`
- [x] 4.2 确认 `packages/config/src/generated/skill-templates.ts` 与 `command-templates.ts` 已包含 `propose-preview` 条目，且原 `propose` 条目的末尾提示已更新
- [x] 4.3 执行 `pnpm check` 通过 lint + typecheck + test

## 5. 验证落盘行为

- [x] 5.1 在临时目录或测试 workspace 执行 `marchen init`，确认 `.claude/skills/marchen-propose-preview/SKILL.md` 已生成，且 frontmatter 包含 `disable-model-invocation: true`
- [x] 5.2 确认 `.claude/commands/marchen/propose-preview.md` 已生成
- [x] 5.3 确认 `.claude/skills/marchen-propose/SKILL.md` 末尾提示已包含 propose-preview 选项

## 6. 手动验证 skill 行为

- [x] 6.1 在 marchen-spec 自身项目中执行 `marchen update` 同步最新模板到 `.claude/`
- [x] 6.2 用本变更（`add-propose-preview-skill`）当样本，手动调用 `/marchen:propose-preview add-propose-preview-skill`，确认生成的 full schema 卡片符合规则（框宽 70、各段上限、影响图或 bullet 退化、风险段存在）
- [x] 6.3 在 lite 变更（如已归档但本地复活的 `remove-review-subagent` 或临时新建 lite 变更）上调用 `/marchen:propose-preview`，确认 lite 输出两段格式且进度条按 10 格画
- [x] 6.4 制造一个 `state: blocked` 的变更（仅 marchen new，不填 tasks），调用 `/marchen:propose-preview` 确认拒绝生成并打印引导提示
