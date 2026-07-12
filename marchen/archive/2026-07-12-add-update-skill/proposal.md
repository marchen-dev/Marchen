# 提案:add-update-skill

## 动机

Marchen 的工作流版图里,"修订已有变更的计划"一直是个没有着落的动作。用户改了主意(方案换了、范围调了、需求加了),唯一的办法是手动编辑 artifact 文件——改了一个,其余产物没人帮着保持一致:proposal 说 A、design 停在旧方案、tasks 还列着过时任务。更糟的是,让 AI 帮忙"更新一下计划"时,它可能顺手把实现代码也改了,而用户只想改计划。

这个缺口在自家 skill 文本里早有痕迹:`apply.md` 和 `lite.md` 的暂停条件写着"发现设计问题 → 建议更新 artifact",但"用什么更新"没有答案。OpenSpec 最近以 `/opsx:update`(PR #1278)补上了同样的缺口,其精简版设计(零新 CLI、纯 skill、依托既有 status/instructions 命令)已被验证可行,值得复刻并本土化。

## 变更内容

新增 `/marchen:update` workflow skill——修订变更的**已有**规划产物,并在**任意方向**上调和其余产物保持一致。绝不修改实现代码。

- 新增 `packages/config/templates/skills/update.md`(核心指令文,中文):六步流程——选变更 → `marchen status` 拿产物清单 → 理解诉求 → 双向调和 → 逐个确认写入 → 指路下一步
- 新增 `packages/config/templates/commands/update.md`(同文薄壳)
- 联动修订既有 skill 文本,消除"孤岛效应":
  - `apply.md` / `lite.md`:"建议更新 artifact" → 指向 `/marchen:update`
  - `propose-preview.md`:"修改提案"选项分叉——改意图 → `/marchen:propose` 重开;改细节 → `/marchen:update`
- `README.md` / `README.en.md` 命令表补充 `/marchen:update` 条目
- 运行 codegen 重新生成 `packages/config/src/generated/*`

**改动面全部为 markdown 模板与文档,0 行 TypeScript 逻辑代码**(生成产物除外)。模板分发依赖既有机制:`generateSkills` / `generateCommands` 遍历全部模板,新模板自动到达所有 provider,无注册清单需要修改。

### 刻意不做(决策记录)

- **不给 `list` 加 `lastModified` 字段**:skill 用 `createdAt` 展示;open 变更较多时用 `ls -dt marchen/changes/*/` 按目录 mtime 兜底排序。存储型 lastModified 走不通(agent 直接改文件,不经过 CLI,元数据必然陈旧),读时计算的收益暂不抵成本。
- **不给 `StatusResult` 加 `changeDir`**:Marchen 单根,路径约定固定为 `marchen/changes/<name>/<path>`,skill 直接拼接(`apply.md` 已有先例)。OpenSpec 需要 `artifactPaths` 是因为它有多根 stores,该约束在 Marchen 不存在。
- **update 不创建缺失产物、不推进构建前沿**:empty/missing 的产物只报告,指向 `/marchen:propose` 或 `marchen instructions` 补全。
- **不触发搜索索引**:索引只覆盖 archive collection,open 变更的修订无需索引;归档时自然收录最终版。

## 能力

### 新增能力

- `update-skill`:`/marchen:update` skill 的行为规格——变更选择、产物获取、双向调和、确认写入、下一步指引、护栏(只改规划产物/schema 驱动/不创建文件/逐处确认)

### 修改能力

- `skill-cross-references`:既有 skill 文本(apply / lite / propose-preview)中"修订计划"类指引统一指向 `/marchen:update`

## 影响范围

- `packages/config/templates/skills/`:新增 update.md,修订 apply.md、lite.md、propose-preview.md
- `packages/config/templates/commands/`:新增 update.md
- `packages/config/src/generated/`:codegen 再生成(skill-templates.ts / command-templates.ts)
- `README.md` / `README.en.md`:命令表
- 无 CLI 命令、core 逻辑、schema 定义、测试断言的改动;与既有 CLI 命令 `marchen update`(更新 skill 文件到最新版本)属两个独立表面,无冲突
- lite schema(仅 tasks 一个产物)下,update 自动退化为单产物修订,无需特判
