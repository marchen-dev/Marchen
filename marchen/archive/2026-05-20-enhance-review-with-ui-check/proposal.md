## 动机

当前 `marchen-review` skill 只能做代码级 review（sub-agent 拿 `git diff` 对照 artifact 检查完整性和一致性），无法验证 UI 行为是否真的符合预期。在做 Web 项目时，用户 apply 完成后仍需手动打开浏览器逐个场景验证，review 阶段存在"静态-运行时"的真空地带。

chrome-devtools MCP 已经在主流 AI 工具（Claude Code、Codex、Cursor、Copilot、Windsurf、Gemini CLI、OpenCode 等）中通用，可以让 sub-agent 直接驱动浏览器执行 specs 里描述的场景，把 review 从"看 diff"扩展到"看页面"，填补这块空白。

## 变更内容

- `marchen-review` skill 增加模式选择：代码 review / UI 验证 / 两者都做（用 AskUserQuestion 在主会话询问，由用户判断）
- 选择模式前嗅探 `git diff --name-only HEAD` 中的 UI 文件（.tsx/.vue/.css 等），把结果作为提示附在 AskUserQuestion 上，不替用户做决定
- sub-agent 在 UI 路径下执行：检测 chrome-devtools MCP 可用性 → 提取 specs 场景 → 探活 dev server URL → 乐观执行场景 → 阻塞即停并记录 ⏭
- 不事前问用户登录态/账号/数据准备等 prep 信息：sub-agent 撞墙后把"需要什么"写进报告，主会话拿到 ⏭ 后再用 AskUserQuestion 决定是否补信息重跑
- chrome-devtools MCP 不可用时静默降级到代码 review 并在报告里标注
- 同步更新 skill 模板（`templates/skills/review.md`）和 command 模板（`templates/commands/review.md`），重新执行 codegen

## 能力

### 新增能力

- `review-ui-verification`：review skill 的 UI 验证能力——模式选择、diff 嗅探提示、UI 场景乐观执行、阻塞回环

### 修改能力

（无 spec 级别的现有能力被修改，review skill 本身没有归档过 spec；本次新增能力作为 review skill 的延伸）

## 影响范围

- `packages/config/templates/skills/review.md`：主要修改
- `packages/config/templates/commands/review.md`：同步修改
- `packages/config/src/generated/`：执行 `pnpm generate` 重新生成 codegen 产物
- 不影响 CLI 命令、Workspace/ChangeManager、shared 类型——纯模板层改动
- 不引入新的 config.yaml 字段，不动 schema
