# 任务:add-update-skill

## 1. 新增 update 模板

- [x] 1.1 编写 `packages/config/templates/skills/update.md`:frontmatter(name: marchen-update + 含"修订/调和/保持一致"触发词与"绝不修改代码"的 description)+ 六步流程(选变更 → status 拿产物 → 理解诉求 → 双向调和 → 逐个确认写入 → 指路下一步)+ 护栏(只改规划产物、schema 驱动不硬编码产物名、只编辑 filled 文件不创建、逐处确认、意图变更建议重开、search 检索历史决策)
- [x] 1.2 编写 `packages/config/templates/commands/update.md`:同文薄壳,输入说明改为 `/marchen:update <name>` 形式

## 2. 联动修订既有 skill 文本

- [x] 2.1 `templates/skills/apply.md` 与 `templates/skills/lite.md`:暂停条件"发现设计问题 → 建议更新 artifact"改为指向 `/marchen:update`
- [x] 2.2 `templates/skills/propose-preview.md`:"修改提案"入口分叉——改意图 → `/marchen:propose`,改细节 → `/marchen:update <name>`
- [x] 2.3 检查 `templates/commands/` 下 apply/lite/propose-preview 的对应文本同步修改

## 3. 生成与文档

- [x] 3.1 运行 codegen(`generate-templates.ts`)重新生成 `packages/config/src/generated/skill-templates.ts` 与 `command-templates.ts`,确认 update 条目自动收录
- [x] 3.2 `README.md` / `README.en.md` 命令表补充 `/marchen:update` 条目
- [x] 3.3 跑通 lint 与既有测试(应零改动通过)

## 4. 自举验证

- [x] 4.1 `marchen init` 或 `marchen update` 到本仓库,确认 `.claude/skills/marchen-update/SKILL.md` 与 `.claude/commands/marchen/update.md` 生成
- [x] 4.2 在本变更(add-update-skill)自身上运行 `/marchen:update`,验证:能读取产物清单、提出修订、逐处确认、不碰代码、正确指路下一步
