## 动机

项目定位已经在 `2026-05-21-reposition-readme-harness` 中从「规范驱动工作流（spec-driven）」升级为 **harness engineering**——给 AI 编码代理搭一层完整的工程化外壳。那次变更的 proposal 已明确预告：「后续会把名字中的 spec 去掉」。本次就是兑现这个计划。

现状是「spec」标签已名不副实，且只残留在少数几个地方：

- **粘着 spec（要改）**：品牌名 `MarchenSpec`、npm 主包名 `marchen-spec`、内部 scope `@marchen-spec/*`、root package name `marchenspec`
- **早已是 marchen（不动）**：CLI 命令 `marchen`、工作区目录 `marchen/`、skill 前缀 `marchen:`

也就是说，`marchen` 早已是事实品牌，`spec` 只是一个还没摘掉的旧标签。去掉它，让品牌名 / 包名 / scope / bin / 目录 / skill 全线统一为一个词 `marchen`，与 harness 这个上位定位对齐。

## 变更内容

执行四组字符串替换，统一收敛到 `marchen`：

| 旧 | 新 | 说明 |
|---|---|---|
| `MarchenSpec` | `Marchen` | 品牌名（README / CLAUDE.md / JSDoc / CLI 文案） |
| `marchen-spec` | `marchen` | npm 主包名（唯一对外发布的包） |
| `@marchen-spec/*` | `@marchen/*` | 内部 scope（4 个包均 `private: true` + CLI `alwaysBundle`，不发布 npm，纯内部字符串） |
| `marchenspec` | `marchen` | root package name |

**不改动**：CLI bin `marchen`、目录 `marchen/`、skill 前缀 `marchen:`、`marchen/archive/**`（历史快照）、`marchen/changelog.md`（历史摘要索引）。

**附带修正**：`packages/core/src/{change-manager,workspace}.ts` 的 JSDoc 中残留的过时目录名 `marchenspec/` → 修正为实际目录名 `marchen/`（与品牌改名无关的注释 bug，顺手修）。

本次不涉及任何 CLI 命令、skill 行为、业务逻辑变化——纯命名标识重构。

## 能力

### 新增能力

- `package-naming` — 项目命名标识规格：定义品牌名、npm 主包名、内部 scope、root name 的统一命名规则与约束，明确「哪些标识收敛到 marchen、哪些保持不动」的边界。

### 修改能力

无（本次为命名重构，不涉及任何现有 capability 的行为变更）。

## 影响范围

- **约 30+ 个活跃文件**，跨 `apps/cli` + 4 个 package + 构建配置 + codegen 链路 + 文档：
  - `package.json` ×6（root + cli + core/config/fs/shared 的 name 与 workspace 依赖）
  - 源码 import `@marchen-spec` → `@marchen` ×16 个 `.ts`（含 test）
  - 构建/测试配置 ×3（`tsdown.config.ts` 的 `alwaysBundle` 正则、`tsconfig.base.json`、`vitest.config.ts`）
  - 品牌名 `MarchenSpec` → `Marchen` ×11 个 `.ts`（JSDoc / CLI 文案 / test）
  - 模板 + codegen：`packages/config/templates/{commands,skills}/explore.md`（源）→ `pnpm generate` 重生成 `generated/*.ts` → `marchen update` 同步 `.claude/`、`.codex/` 落盘文件
  - 文档：`README.md` / `README.en.md`（品牌名 + npm badge + install ×2）、`apps/cli/README.md`、各级 `CLAUDE.md`
- 共 57 处 `@marchen-spec` scope 替换；`pnpm-lock.yaml` 由 `pnpm install` 自动重建，不手改
- **对外影响**：npm 包页面与 GitHub 首页的项目标识；旧包 `marchen-spec` 需发布一版 deprecate 指向 `marchen`，避免旧用户与搜索收录断链
- **不影响**：CLI 命令行为、skill 流程、search/archive/工作区结构、历史归档
