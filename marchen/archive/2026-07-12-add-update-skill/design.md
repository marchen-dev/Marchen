# 设计:add-update-skill

## 背景

Marchen 的 skill 分发链路已经成熟:`packages/config/templates/` 下的 markdown 经 `scripts/generate-templates.ts` codegen 为 `src/generated/*` 常量,`workspace.generateSkills` / `generateCommands` 遍历全部模板写入各 provider 目录——**无注册清单,新模板自动分发**。CLI 侧,`marchen status <name> --json` 返回产物 id/状态/相对路径(specs 附 `capabilities[]`),`marchen instructions <name> <artifact> --json` 返回模板与指导文本。这两个命令就是 update skill 需要的全部数据面。

本设计复刻 OpenSpec `/opsx:update`(PR #1278)的精简版形态:该提案最初包含反向依赖图 API、内容摘要、基线账本、reconcile 写操作,评审后全部砍掉,收敛为"一个薄 skill 覆盖既有 CLI"。Marchen 直接从这个已被验证的终点起步。

## 目标与非目标

**目标**

- 新增 `/marchen:update`:修订变更已有规划产物,双向调和保持一致,绝不修改代码
- 全部改动为 markdown 模板与文档,0 行 TypeScript 逻辑代码
- 消除既有 skill 文本中"修订计划"指引的孤岛效应

**非目标**

- 不新增 CLI 动词(`marchen update` 已被"更新 skill 文件"占用,两表面独立)
- 不做内容摘要、漂移检测、依赖图 API 等重机制
- 不支持跨变更审计;不创建缺失产物(那是 propose/instructions 的职责)
- 不改 core/schema/测试

## 决策

### 1. skill 形态,不加 CLI 动词

"update"在 CLI 层已有含义(更新 skill 文件到最新版本)。规划产物的修订价值在 AI 的语义调和,不在确定性重写,做成 skill 恰当;`/marchen:` 命名空间里每个动词都作用于变更,语境自明。与 OpenSpec 的 Naming 决策一致。

### 2. 双向调和,而非下游传播

构建顺序(proposal → specs/design → tasks)是好的**阅读**顺序,不是修订方向的约束:改 design 可能要回改 proposal,tasks 暴露缺口可能要补 specs。skill 文本明确"任意方向"检查,不提供也不需要单向 impact 原语。

### 3. 路径靠约定拼接,不加 changeDir 字段

Marchen 单根,变更恒在 `marchen/changes/<name>/`,status 返回的相对 path 直接拼上去即可(apply.md 用 instructions 返回的 changeDir、explore.md 直接写字面路径,均有先例)。OpenSpec 之所以要 `artifactPaths.existingOutputPaths`,是因为多根 stores 使约定不可用——该约束在 Marchen 不存在,教条不搬运。

### 4. 不给 list 加 lastModified

存储型 lastModified 结构性走不通:agent 用文件工具直接改 artifact,不经过 CLI,元数据必然陈旧;读时计算(遍历 stat)可行但收益小——选择列表只在"用户没指名"时出场。skill 层兜底:展示 `createdAt`,open 变更较多时用 `ls -dt marchen/changes/*/` 按目录 mtime 排序辅助推荐。若未来多变更并行成为常态,再把读时计算收编进 CLI(视图型增强字段,与 ChangeMetadata 存储类型分离)。

### 5. 不推进构建前沿

update 只编辑 `filled` 产物;empty/missing 只报告并指路。保持与 propose(创建)、apply(实现)、archive(收尾)的职责正交,也是 OpenSpec "do not advance the build frontier" 护栏的直接对应。

### 6. 与 explore 捕获的路由边界

Marchen 有三条会动产物的路径,description 需划清:explore=思考中顺手捕获(无一致性检查);update=专门修订+全套调和;propose=意图变更重开。update 的 description 用"修订/调和/保持一致"类词,并在护栏中写明"意图变更→建议重开",复用 review.md"review 不是 apply"的句式风格。

### 7. 搜索索引零处理

`SearchManager` 只索引 archive collection,open 变更修订无需触发;归档时 `indexChange()` 全量重扫,修订后的最终版自然进入长期记忆。update 的"故意不做"决策记入本 design,归档后可被 `marchen search` 召回——这正是长期记忆支柱的预期用法。

### 8. update skill 独有增强:search 护栏

调和时可用 `marchen search "<相关方案>" --json` 检索历史归档,避免与过去已记录的决策冲突。这是 OpenSpec 没有的能力(它无语义检索),与 Marchen 记忆支柱天然契合,一句护栏零成本。

## 风险与权衡

- **`ls -dt` 在 Windows PowerShell 不可用**:主流 agent 环境(含 Windows 上的 git-bash)基本可用;且仅是兜底路径,失败时退回 createdAt 展示,无功能损失。
- **约定路径拼接对未来多根架构不友好**:若 Marchen 未来引入类似 stores 的多根模型,update.md 需与其他 skill 一起迁移到"从 CLI 拿路径"——届时是全家统一迁移,不是本 skill 独有债务。
- **skill 指令文的遵循度依赖模型**:护栏(逐处确认、不碰代码)写在文本层,无强制机制。与 Marchen 全部既有 skill 同一信任模型,不新增风险面。
- **propose-preview 分叉指引可能增加用户决策负担**:两个入口(意图→propose、细节→update)的判断标准在文本中给出示例,实践中由 AI 代为判断并推荐。
