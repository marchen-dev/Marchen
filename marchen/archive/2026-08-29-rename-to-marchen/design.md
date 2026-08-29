## 背景

项目定位已从 spec-driven 升级为 harness engineering，但 `spec` 标签仍残留在品牌名 `MarchenSpec`、npm 主包名 `marchen-spec`、内部 scope `@marchen-spec/*`、root name `marchenspec`。探索阶段的代码调查得出三个关键事实，决定了本次方案的形状：

1. **scope 是纯内部命名**：4 个内部包（core / config / fs / shared）均 `"private": true`，且 CLI 通过 `tsdown.config.ts` 的 `alwaysBundle: [/^@marchen-spec\//]` 把它们打包进产物。因此 `@marchen-spec/*` → `@marchen/*` 是**纯字符串重构**，不涉及 npm 发布、不需要注册 `@marchen` org。
2. **唯一对外发布的包**是主包（`apps/cli`，name = `marchen-spec`）。
3. **codegen 链路有先后顺序**：`packages/config/templates/{commands,skills}/*.md`（源）→ `pnpm generate` → `packages/config/src/generated/*.ts`（产物）→ `marchen update` → `.claude/`、`.codex/` 落盘文件。改名涉及模板的部分必须从源头改、按链路重生成，不能手改产物。

`marchen` 早已是 bin / 目录 / skill 前缀的事实品牌，本次只摘掉 `spec` 旧标签。

## 目标与非目标

**目标：**

- 品牌名 `MarchenSpec` → `Marchen`、主包名 `marchen-spec` → `marchen`、scope `@marchen-spec/*` → `@marchen/*`、root name `marchenspec` → `marchen`
- 改名后 `pnpm check`（lint + typecheck + test）全绿，CLI 构建产物 bundle 正常
- 工作区结构、CLI 命令行为、skill 流程**零变化**

**非目标：**

- 不改任何 CLI 命令、skill 行为、search / archive / 业务逻辑
- 不改 bin `marchen`、目录 `marchen/`、skill 前缀 `marchen:`
- 不改 `marchen/archive/**` 与 `marchen/changelog.md`（历史快照）
- **不在本次变更内执行 npm 实际发布**——本次让仓库代码就绪；「发布 `marchen` + deprecate `marchen-spec`」作为发布清单项列入 tasks，由人工在 release 时执行

## 决策

### 决策 1：scope 采用 `@marchen`，而非去 scope 或保留 `@marchen-spec`

内部包不发布，scope 纯属 monorepo 内部命名空间。三个选项：

- **`@marchen/*`（选定）**：与品牌一致，保留命名空间隔离，改动是机械替换
- 去掉 scope：会让内部包失去命名空间，且要重排所有 import，收益为负
- 保留 `@marchen-spec/*`：与「去 spec」目标矛盾，自相残留

### 决策 2：纳入 core JSDoc 注释 `marchenspec/` → `marchen/` 的修正

`packages/core/src/{change-manager,workspace}.ts` 的 JSDoc 把目录名写成 `marchenspec/`，而实际目录早已是 `marchen/`——这是与改名无关的注释 bug。既然本次正在改动这些文件，顺手修正为正确的 `marchen/`。风险极低（纯注释，不影响行为）。

### 决策 3：旧包 `marchen-spec` 发布 deprecation 指向 `marchen`

README / npm 包页面已被搜索引擎与文档链接收录，直接弃用会断链。采用 npm 标准做法：

- 主包 `package.json` 的 name 改为 `marchen`，正常发布新包
- 对旧包名 `marchen-spec` 发布一版仅含 `npm deprecate` 提示的版本，引导迁移到 `marchen`
- 此发布动作为**人工 release 步骤**，tasks 中以清单形式记录，不由代码改动自动触发

### 决策 4：按「字符串种类」分批替换，严格区分活跃区与归档区

替换需精确匹配、注意子串包含关系：

- `marchen-spec` 是 `@marchen-spec` 的子串。**执行顺序**：先替换 `@marchen-spec` → `@marchen`，剩下的裸 `marchen-spec` 即主包名引用，再单独处理，避免误伤。
- `marchenspec`（root name + 注释）独立替换为 `marchen`。
- `MarchenSpec`（品牌名）独立替换为 `Marchen`。
- **归档区 `marchen/archive/**` 与 `marchen/changelog.md` 显式排除**——这些保留旧标识是正确的历史记录。
- codegen 产物（`generated/*.ts`、`.claude/`、`.codex/` 落盘文件）不手改：改模板源 → `pnpm generate` → `marchen update` 重新生成。

### 决策 5：分层验证

- scope 改名最易漏 import，每批改完跑 `pnpm typecheck` 兜底
- 重新 `pnpm install` 重建 `pnpm-lock.yaml`（残留旧 scope 会失配）
- 构建 CLI，确认 `alwaysBundle` 正则已更新且 bundle 正常
- 全部完成跑 `pnpm check`（lint + typecheck + test 全绿）
- 在本项目自身 dogfood：`marchen update` 同步落盘文件后人工 diff 检查

## 风险与权衡

| 风险 | 缓解 |
|---|---|
| scope 漏改导致 import 断裂 | `pnpm typecheck` 全量兜底，分批改分批验证 |
| codegen 产物与源不一致（只改产物或只改源） | 改模板后必跑 `pnpm generate`，`git diff` 检查 `generated/*.ts` 已同步；再 `marchen update` 同步落盘 |
| `pnpm-lock.yaml` 残留旧 scope | 改完重新 `pnpm install` 重建 lockfile |
| 误伤 `marchen/archive/**` 历史 | 替换命令显式排除归档区，最终 review diff 确认归档未变动 |
| 旧用户仍安装旧包 | deprecate 提示引导迁移（人工发布，本次仅规划入清单） |

**权衡**：改名后全局搜索 `marchen-spec` / `@marchen-spec` 在 `archive/` 里仍会有命中。这是**正确的**——归档是历史真相，不应篡改。通过保留边界约束（spec 中已声明）而非全局替换来处理。
