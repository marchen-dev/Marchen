## 目的

去掉独立的 review 入口，避免和 acceptance 抢「做完之后干什么」。

### 需求: 删除 review 模板

发行物 MUST NOT 再包含名为 review 的 skill 或 command 模板。`marchen init` / `marchen update` 之后，各工具的 skill 目录 MUST NOT 再新写入 `review.md`。

#### 场景: 新 init 没有 review

- **GIVEN** 本变更已发布
- **WHEN** 用户在空项目执行 `marchen init` 并选中任一工具
- **THEN** 生成的 skill / command 列表不含 review
- **AND** 含有 acceptance

### 需求: 文案不再指向 review

apply、lite、archive、propose、update 以及 README 中作为下一步的 review 提示 MUST 改为 acceptance 或去掉。

#### 场景: apply 完成提示不再提 review

- **GIVEN** 用户读 apply skill 的完成段
- **WHEN** 查看「全部完成」之后的指引
- **THEN** 文案不出现 `review`
- **AND** 指引走向 acceptance

### 需求: 已装机的旧 review 文件

`marchen update` SHOULD 删除各工具目录里由 Marchen 生成的 `review` skill/command 文件。若无法安全删除，MUST 在更新输出里提示人工删掉，以免和 acceptance 并存。

#### 场景: update 清理旧文件

- **GIVEN** 某工具目录里仍有旧的 `review.md`
- **WHEN** 用户执行 `marchen update`
- **THEN** 该文件被删除，或更新日志明确提示删除它
