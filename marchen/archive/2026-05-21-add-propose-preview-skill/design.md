## 背景

marchen-spec 项目当前已有 6 个 skill 模板（propose / lite / apply / explore / archive / review），均位于 `packages/config/templates/skills/` 下，通过 `pnpm generate` 脚本 codegen 成 TS 常量，再由 `Workspace.generateSkills()` 在 `init` / `update` 时落盘到 `.claude/skills/<name>/SKILL.md`（每个 skill 一个目录，符合官方规范）。

现有所有 skill 的 frontmatter 仅使用 `name` + `description` 两个字段，与官方推荐的 frontmatter 字段相比偏简。本变更引入第一个使用 `disable-model-invocation` 等推荐字段的 skill，作为后续可参考的范式。

数据源 `marchen instructions <name> apply --json` 已在 `add-apply-command` 归档变更中实现，其返回的 `context` 数组已包含每个 artifact 的完整 `content`，足以支撑摘要生成。

## 目标与非目标

**目标：**
- 新增 `marchen-propose-preview` skill，通过 `/marchen:propose-preview <name>` 显式调用
- 在 `marchen-propose` skill/command 完成提示中加入 preview 选项（纯文字）
- 摘要规则、卡片格式以 prompt 形式硬约束在 SKILL.md 中，无 CLI 代码改动
- 复用现有 codegen / init / update 流程，零核心代码改动

**非目标：**
- 不持久化摘要为文件
- 不引入新的 CLI 命令（不新增 `marchen preview` 之类）
- 不修改 artifact 模板本身（proposal / design / spec / tasks）
- 不升级 codegen 以支持目录型 skill 多文件（即不引入 supporting files）—— 留待独立变更
- 不修改其他 skill 的 frontmatter

## 决策

### 决策 1：纯 skill 模板层实现，不动 CLI 代码

不新增 CLI 命令、不动 core 包。所有逻辑通过 SKILL.md 的 prompt 指令驱动主会话内的 LLM + Bash 工具完成。

**理由：** 数据源已就绪（`marchen instructions apply --json`），摘要生成本质是 LLM 能力，没有计算密集型或确定性逻辑必须放在 CLI 里。零 CLI 改动 = 零回归风险。

**替代方案：** 实现 `marchen preview <name>` CLI 命令拼装卡片骨架。被否决：CLI 拼装无法生成 ASCII 影响图，且 marchen CLI 当前不依赖任何 LLM API，引入会破坏纯本地工具定位。

### 决策 2：frontmatter 使用 `disable-model-invocation: true`

新 skill 是用户决定要不要看的，不属于 AI 应自主判断的工作流环节。

**理由：** 官方文档明确指出该字段适用于 "workflows you want to trigger manually with /name"。preview 正是这种。设了之后，Claude 也不会把该 skill 的 description 加入常驻 context，节省 token。

**替代方案：** 不设该字段，让 Claude 在判断"用户想看摘要"时自动调用。被否决：会与 `/marchen:apply` 之类显式命令的语义混淆，也违背用户"propose 完成后由用户决定"的明确要求。

### 决策 3：frontmatter 不加 `allowed-tools`

不预批准 `Bash(marchen *)`。

**理由：** 用户明确要求不加。每次首次执行时由用户授权 Bash 调用是可接受的代价；不加保留更严格的权限控制，与现有 skill 一致（现有 skill 均未使用 `allowed-tools`）。

### 决策 4：保留项目现有 skill 写作风格

继续使用"frontmatter → 一段概述 → `---` → 编号流程 → 护栏"的项目本地风格，不切换为官方示例的"`## 标题` 紧凑风格"。

**理由：** 项目内 6 个现有 skill 都用同款风格，一致性高于"严格贴合官方示例"。`---` 在 SKILL.md body 中是合法的 markdown 水平分割线，不违反规范。

### 决策 5：lite schema 也生成摘要（精简版两段）

lite 变更的摘要包含"改了什么"和"任务概览"两段。

**理由：** 用户明确选定该方案（在探索阶段）。lite 变更虽然只有 tasks.md 一个 artifact，但任务量较多时（如 `remove-review-subagent` 共 17 个任务）依然有 review 价值。提供进度条可视化是 lite 摘要的独有价值。

**替代方案：** lite 直接拒绝并提示"lite 无需预览"。被否决：用户已拒绝。

### 决策 6：摘要规则以表格形式列在 SKILL.md 中

不放在 SKILL.md 之外（如 supporting file），不使用散文形式。

**理由：** 项目当前 codegen 流程把每个 skill 的源 .md 转为单段字符串常量，未支持目录型多文件源。表格形式比散文形式约束力更强（"≤6 条"比"几条"清晰），LLM 服从度更高。

**未来工作：** 升级 codegen 支持 supporting files 可作为独立变更，那时再把规则与样例外移。

### 决策 7：阻塞状态拒绝生成

`state: blocked` 时打印提示后退出，不强行摘要半成品。

**理由：** 半成品摘要可能让用户误以为变更已就绪。明确拒绝并指引用户先用 `/marchen:propose` 补齐，路径更清晰。

### 决策 8：卡片框宽固定 70 字符

不动态感知终端宽度。

**理由：** SKILL.md 是 prompt，无法运行代码获取 `process.stdout.columns`。70 字符在主流终端（80+ 列）下显示完整，在 100+ 列宽屏终端下显得偏窄但不至于换行错乱。动态宽度需要 CLI 配合，违背"零 CLI 改动"原则。

## 风险与权衡

### 风险 1：LLM 不严格遵守摘要规则

即使 SKILL.md 写了"≤6 条 bullet"，LLM 仍可能输出 8 条。

**缓解：** 规则以表格形式呈现（比散文约束力强）；用"必须"、"禁止"等硬性词；在多轮使用后通过 review 反馈持续迭代 prompt。

### 风险 2：ASCII 影响图质量不稳定

LLM 画 ASCII 图容易出现节点错位、箭头不齐。

**缓解：** SKILL.md 中明确写"画不下/关系不清晰时改用 bullet 列模块"，给出明确退化路径，避免歪斜输出。

### 风险 3：SKILL.md 本身较长占用 context

新 skill 含规则表 + 两份输出样例，预计约 130 行。每次激活后会一直留在 context。

**缓解：** 通过 `disable-model-invocation: true` 阻止 Claude 自动加载该 skill 的 description（仍会进 listing 但是 skill 内容不会进 context，除非用户显式 `/` 调用）；后续若性能压力显现，可升级 codegen 把规则和样例移到 supporting file。

### 风险 4：propose 模板末尾文案变更可能影响其它依赖该输出的工具

`marchen-propose` 的完成提示是用户感知节点。

**缓解：** 仅在尾部追加 preview 选项，不删除原有 `/marchen:apply` 提示；保留 `marchen status` 命令的原始调用，不破坏后续工具链。
