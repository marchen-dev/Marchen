## 1. 移除 CLI 搜索入口与运行路径

- [x] 1.1 删除 `apps/cli/src/commands/search.ts`，从 CLI program 移除注册，并扩展 CLI 测试确认帮助中不再包含 `search`、调用时按未知命令处理。
- [x] 1.2 从 `init` 移除搜索确认、模型下载和相关参数传递，补充测试确认初始化不再出现搜索交互。
- [x] 1.3 从 `update` 移除搜索配置读取、模型同步和 spinner 文案，保持现有 provider 模板更新结果输出。
- [x] 1.4 删除仅供模型下载使用的 `model-progress` 工具及引用，确认 CLI 其他命令没有搜索运行时消费者。

## 2. 退役 Core 与 Shared 搜索领域

- [x] 2.1 删除 SearchManager 与 QMD 模型定义文件，清理 Core 公共类型/类导出及所有非历史引用。
- [x] 2.2 从 ChangeManager archive 生命周期移除自动索引 hook、超时逻辑和动态 import，并删除测试中的 QMD mock；保留归档与 changelog 行为测试。
- [x] 2.3 从 Workspace 移除 `searchDbPath`、初始化搜索目录、`searchEnabled` 初始化选项及新配置中的 `search/models` 字段。
- [x] 2.4 调整 Workspace update：在版本跳过判断之外幂等删除旧 `search/models` 字段，同时保留其他配置和既有模板更新语义。
- [x] 2.5 从 Shared 的 WorkspaceConfig 和公共导出中删除搜索/模型配置，从常量与导出中删除仅供 QMD 使用的 HuggingFace 默认端点。
- [x] 2.6 扩展 Workspace 测试，覆盖新初始化无搜索状态、旧配置迁移、同版本迁移、重复迁移幂等、非搜索字段保留以及不删除遗留 `.search` 文件。

## 3. 清理依赖与构建边界

- [x] 3.1 从 CLI 和 Core package manifest 删除 `@tobilu/qmd`、`node-llama-cpp` 直接依赖，并确认仓库不存在其他合法消费者。
- [x] 3.2 从 CLI tsdown 配置删除搜索原生依赖的 `neverBundle` 配置，保持其余 bundle 边界不变。
- [x] 3.3 使用 pnpm 重新解析 lockfile，确认 QMD 与搜索专用 LLM 原生依赖闭包不再由 Marchen workspace 引入。

## 4. 更新工作流模板与生成产物

- [x] 4.1 修改 Explore Skill/Command 源模板：删除语义搜索步骤和降级分支，固定为 list → changelog → 候选 archive，并保留已存在或随后合入的 idea 调查路径。
- [x] 4.2 修改 Apply Skill/Command 源模板，删除 `marchen search` 建议，改为从 changelog 与相关 archive 核对历史决策。
- [x] 4.3 清理其他当前模板中的已删除 API 示例和 QMD/search 功能性引用，包括 propose-preview 的 `SearchManager` 示例名。
- [x] 4.4 运行模板 codegen 更新 Config generated 常量，并通过 Marchen 的正常生成/update 路径同步仓库 `.agents`、`.claude/skills`、`.claude/commands` 托管文件。
- [x] 4.5 增加模板与 provider 回归测试，确认所有生成目标内容一致且不再包含已退役搜索指引，同时不覆盖 idea workflow 内容。

## 5. 文档、迁移说明与验证

- [x] 5.1 更新中英文 README 的定位、功能表、命令示例和历史调查说明，删除当前 Hybrid Search/QMD 宣称，补充 breaking change 与 `marchen update` 迁移步骤。
- [x] 5.2 更新根 AGENTS.md、CLAUDE.md 和 CLI/Core 包级说明，移除 SearchManager、search 命令、模型下载与索引架构描述。
- [x] 5.3 保留 `.search/` ignore 和所有 archive/changelog 历史；文档仅提供带共享缓存风险说明的可选手动清理方法，不执行自动删除。
- [x] 5.4 对排除 `marchen/archive`、`marchen/changelog.md` 和第三方工具说明后的当前代码、模板、生成文件与文档运行残留扫描，确认无 `marchen search`、QMD、Hybrid Search、模型端点或搜索索引消费者。
- [x] 5.5 运行格式化、针对性单元测试、类型检查、`pnpm check` 与 `pnpm build`，确认非搜索能力和发行构建完整通过。
- [x] 5.6 在临时新旧工作区手工验证 init、同版本/跨版本 update、archive、CLI 帮助和未知 search 命令；确认废弃配置与托管模板被迁移，但遗留索引和用户模型缓存未被修改。
