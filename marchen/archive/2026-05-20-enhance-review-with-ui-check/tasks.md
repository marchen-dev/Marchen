## 1. 改写 skill 模板

- [x] 1.1 在 `packages/config/templates/skills/review.md` 步骤 1 之后插入"嗅探 diff 中的 UI 文件"步骤，使用 `git diff --name-only HEAD | grep -E '\.(tsx?|jsx?|vue|svelte|astro|css|scss|less|html)$'`
- [x] 1.2 在原有"选择变更"和"Spawn sub-agent"之间插入 AskUserQuestion 模式选择步骤，三个选项：代码 review / UI 验证 / 两者都做；diff 嗅探命中时在描述里附提示
- [x] 1.3 改写 sub-agent prompt 的"获取意图与改动"为公共部分，标注按 `<mode>` 走分支
- [x] 1.4 保留原"代码 review"对照逻辑作为公共部分之后的代码分支
- [x] 1.5 新增"UI 验证"分支：检测 chrome-devtools MCP 可用性（用只读工具 probe），不可用则在报告里标注 ⏭ 并附 `npx chrome-devtools-mcp@latest` 安装提示
- [x] 1.6 在 UI 分支加入"提取场景"步骤，优先 specs 的 `#### 场景:` 块，回退 tasks/proposal，仍无则标注 "未找到可验证的 UI 场景"
- [x] 1.7 在 UI 分支加入"推断 dev server URL"步骤，从 package.json/框架配置/.env/README 推断而非硬扫端口；推不出或导航失败则全部场景 ⏭ "URL unknown"
- [x] 1.8 在 UI 分支加入"乐观执行场景"指引：navigate → snapshot → 按场景交互 → 比对；阻塞即停不绕过、不猜数据，记录 ⏭ 跳下一个
- [x] 1.9 定义 UI 报告格式：✅ 通过 / ❌ 失败（附证据）/ ⏭ 跳过（附阻塞原因），独立章节
- [x] 1.10 改写步骤 3"展示报告"为分支处理：含 ⏭ 时弹出 AskUserQuestion 让用户选择补信息重跑 / 跳过继续归档 / 暂停修复；无 ⏭ 时按现状提示
- [x] 1.11 实现"补信息重跑"分支：主会话收集 URL/账号/数据，重新 spawn sub-agent 并把信息注入 prompt
- [x] 1.12 在 sub-agent prompt 的"约束"章节加入敏感信息处理指引（不复述凭据、截图脱敏、用占位符）
- [x] 1.13 更新顶部 description 字段简要提及 UI 验证能力
- [x] 1.14 更新底部"护栏"章节，加入"sub-agent 不向用户提问"、"阻塞即停不硬闯"、"不管理 dev server 生命周期"等新护栏

## 2. 同步 command 模板

- [x] 2.1 把 `packages/config/templates/commands/review.md` 改写为与 skill 模板等价的流程，仅在"调用入口"措辞上允许差异
- [x] 2.2 校对两份模板内容一致（AskUserQuestion 文案、sub-agent prompt 文本、报告格式）

## 3. 重新生成 codegen 产物并验证

- [x] 3.1 执行 `pnpm generate` 重新生成 `packages/config/src/generated/skill-templates.ts` 和 `command-templates.ts`
- [x] 3.2 执行 `pnpm build` 确认所有包构建通过
- [x] 3.3 执行 `pnpm check` 通过 lint + typecheck + test
- [x] 3.4 手动比对 `src/generated/skill-templates.ts` 和 `command-templates.ts` 中 review 段落，确认包含新流程关键段（嗅探/AskUserQuestion 模式/UI 验证分支/⏭ 报告/回环）
