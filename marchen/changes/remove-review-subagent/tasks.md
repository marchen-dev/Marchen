## 背景

刚归档的 `enhance-review-with-ui-check` 给 review skill 加了 UI 验证模式，但仍沿用了"主会话 spawn sub-agent 跑 review"的旧架构。实测发现这个架构对 UI 验证完全错配：

- sub-agent 不能 AskUserQuestion → 撞墙只能 ⏭，不能协商
- sub-agent 不能 run_in_background → 起不了 dev server
- sub-agent 黑盒 4 分钟，用户看不到中间状态

进一步分析后，code review 走 sub-agent 的"保护主 context"价值在 Opus 4.7 1M context 下也很弱（典型 diff 30k tokens 完全能 hold），还失去了"撞墙能就地问用户"的能力。

本变更把 review skill 改为**全主会话执行**：code review 和 UI 验证都在主会话里直接做，不再 spawn sub-agent。skill 模板和 command 模板同步改写。

## 1. 改写 skill 模板

- [x] 1.1 移除 `packages/config/templates/skills/review.md` 中的 "Spawn sub-agent" 步骤和嵌入的 sub-agent prompt
- [x] 1.2 把原 sub-agent prompt 的内容直接展开为主会话流程的步骤指引（用第二人称写给读 skill 的 AI 自己执行）
- [x] 1.3 code review 路径改为：主会话 `marchen instructions <name> apply --json` + `git diff HEAD` + 对照 artifact 直接生成报告
- [x] 1.4 UI 验证路径改为：主会话探测 chrome-devtools MCP → 推断 dev server URL → 推断到但导航失败时 AskUserQuestion 询问是否帮起 dev server（run_in_background 启动 + 轮询端口就绪）→ 主会话驱动 chrome mcp 跑场景
- [x] 1.5 阻塞处理保持"乐观执行 + 阻塞即停"，但主会话可以就地 AskUserQuestion（不再积攒 ⏭ 等最后处理）
- [x] 1.6 dev server 由主会话起的，review 结束后告知用户进程信息（PID/端口），不自动 kill
- [x] 1.7 更新顶部 description 字段，不再提"sub-agent"
- [x] 1.8 更新底部"护栏"章节：删掉"必须使用 sub-agent"、"sub-agent 不向用户提问"等不再适用的条目；保留"不修改任何代码"、"阻塞即停不硬闯"、"敏感信息不写 artifact" 等仍有效的条目；新增"dev server 启动由用户授权"

## 2. 同步 command 模板

- [x] 2.1 把 `packages/config/templates/commands/review.md` 改写为与 skill 模板等价的全主会话流程，仅"调用入口"措辞允许差异
- [x] 2.2 diff 校对两份模板，确认非入口差异（frontmatter / 入口 / 归档提示语）之外完全一致

## 3. 重新生成 codegen 产物并验证

- [x] 3.1 执行 `pnpm --filter @marchen-spec/config generate`
- [x] 3.2 执行 `pnpm check` 通过 lint + typecheck + test
- [x] 3.3 grep `src/generated/skill-templates.ts` 和 `command-templates.ts` 中 review 段落，确认不再出现 "Spawn sub-agent" / "sub-agent" 相关执行措辞（仅保留显式说明"不 spawn sub-agent"的负面引用），且新流程关键段（AskUserQuestion 起 dev server、主会话执行）存在

## 4. 去掉环境判断类的硬规约

- [x] 4.1 把步骤 2 嗅探 UI 文件的硬扩展名正则改为"由模型判断 diff 是否涉及前端 UI"
- [x] 4.2 把步骤 6.d 起 dev server 的"60 秒硬超时"改为"按进程行为判定失败（进程退出/长时间无输出/报错日志），不设硬上限"
- [x] 4.3 把步骤 4 大 diff 阈值描述"多个 MB / 几万行"改为"可能挤占 context 时"
- [x] 4.4 skill 和 command 两份模板同步改，重新跑 codegen + check
