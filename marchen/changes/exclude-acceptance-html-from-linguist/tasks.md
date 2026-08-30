## 背景

Marchen 归档的单文件验收页体积较大，会被 GitHub Linguist 计入 HTML，掩盖项目真实的 TypeScript 语言构成。仓库自身应增加仅针对归档验收页的 generated 规则；CLI 还应在 init 和 update 时幂等补齐该规则，同时保留用户已有的 `.gitattributes` 内容。

## 1. Linguist 规则与工作区迁移

- [x] 1.1 在仓库根目录增加 `.gitattributes`，只将 `marchen/archive/**/acceptance/index.html` 标记为 `linguist-generated`。
- [x] 1.2 在 Workspace 中实现幂等的 `.gitattributes` 补齐逻辑，并在 init 与 update（含同版本更新）中调用，保留已有内容且不重复写入。
- [x] 1.3 增加 Workspace 测试，覆盖文件不存在、已有内容保留、规则已存在和同版本 update 场景。
- [x] 1.4 更新相关说明并运行格式化、针对性测试及完整检查。
