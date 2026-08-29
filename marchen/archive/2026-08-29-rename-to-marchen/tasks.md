## 1. scope 替换 @marchen-spec → @marchen

> 先做 scope：它是 `marchen-spec` 的子串，先替换可避免后续误伤主包名。

- [x] 1.1 改 4 个内部包 `package.json` 的 `name`：`@marchen-spec/{core,config,fs,shared}` → `@marchen/*`
- [x] 1.2 改各 `package.json` 的 workspace 依赖引用（`apps/cli`、`core`、`config`、`fs` 中所有 `@marchen-spec/* : workspace:*`）
- [x] 1.3 替换 16 个源码/test 文件的 import：`apps/cli/src/commands/{init,new,search,status,update}.ts`、`apps/cli/src/utils/{context,error,model-progress}.ts`、`packages/config/src/{index,providers,schema}.ts`、`packages/core/src/{change-manager,index,search-manager,workspace}.ts`、`packages/fs/src/{directory,file,paths,yaml}.ts`、`packages/core/test/{change-manager,workspace}.test.ts`
- [x] 1.4 改构建/测试配置：`apps/cli/tsdown.config.ts` 的 `alwaysBundle: [/^@marchen-spec\//]` 正则、`tsconfig.base.json`、`vitest.config.ts` 中的 scope 引用
- [x] 1.5 `pnpm install` 重建 workspace 软链与 `pnpm-lock.yaml`，再 `pnpm typecheck` 验证 import 无断裂

## 2. 主包名与 root name 替换

- [x] 2.1 改 `apps/cli/package.json` 的 `name`：`marchen-spec` → `marchen`
- [x] 2.2 改 root `package.json` 的 `name`：`marchenspec` → `marchen`
- [x] 2.3 改 `README.md` / `README.en.md`：npm badge、`npm install -g marchen-spec`（含 `@latest`）共 2 处安装命令
- [x] 2.4 改 `apps/cli/README.md`：标题 `# marchen-spec`、`npx marchen-spec`、`npm i -g marchen-spec`

## 3. 品牌名 MarchenSpec → Marchen（活跃文件，不含 codegen 产物）

- [x] 3.1 改源码 JSDoc / CLI 文案 ×11 个 `.ts`：`apps/cli/src/commands/{archive,init,list,new,status,update}.ts`、`apps/cli/src/utils/error.ts`、`apps/cli/test/cli.test.ts`、`packages/config/src/index.ts`、`packages/core/src/{change-manager,search-manager,workspace}.ts`、`packages/fs/src/directory.ts`、`packages/fs/test/fs.test.ts`、`packages/shared/src/{errors,index}.ts`
- [x] 3.2 改各级 `CLAUDE.md`：root、`apps/cli`、`packages/{config,core,fs,shared}`（品牌名 + 架构图中 `marchen-spec CLI` 标注 + scope 引用）
- [x] 3.3 改 `README.md` / `README.en.md` 正文中的品牌名 `MarchenSpec` → `Marchen`

## 4. codegen 链路（改源 → 重生成 → 同步落盘）

- [x] 4.1 改模板源 `packages/config/templates/commands/explore.md` 与 `templates/skills/explore.md` 中的 `MarchenSpec`
- [x] 4.2 跑 `pnpm generate` 重新生成 `packages/config/src/generated/{command,skill}-templates.ts`，`git diff` 确认产物已同步、未手改
- [x] 4.3 在本项目跑 `marchen update` 同步 `.claude/skills/marchen-explore/SKILL.md`、`.claude/commands/marchen/explore.md`、`.codex/skills/marchen-explore/SKILL.md`，diff 检查落盘内容正确

## 5. 附带修正 core JSDoc 过时目录名

- [x] 5.1 改 `packages/core/src/{change-manager,workspace}.ts` JSDoc 中的 `marchenspec/` → 实际目录名 `marchen/`（约 9 处注释）

## 6. 全量验证

- [x] 6.1 `pnpm build` 构建全部包，确认 CLI bundle 正常（`alwaysBundle` 正则已生效，`@marchen/*` 被打包进产物）
- [x] 6.2 `pnpm check`（lint + typecheck + test）全绿
- [x] 6.3 `git diff --stat` review：确认 `marchen/archive/**` 与 `marchen/changelog.md` **未被改动**，改名仅落在活跃区
- [x] 6.4 全局 `grep -rI "@marchen-spec\|marchen-spec\|MarchenSpec\|marchenspec"` 排除 `marchen/archive` 后应无残留（archive 内命中属正常历史）

## 7. 发布清单（人工 release 步骤，不在代码改动内）

- [ ] 7.1 发布新包 `marchen` 到 npm
- [ ] 7.2 对旧包 `marchen-spec` 执行 `npm deprecate marchen-spec "已更名为 marchen，请改用 npm i -g marchen"`
- [ ] 7.3 更新 GitHub 仓库描述 / 标识中的项目名为 Marchen
