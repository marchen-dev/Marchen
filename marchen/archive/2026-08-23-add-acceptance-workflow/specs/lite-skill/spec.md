## 目的

lite 收尾仍保持一问，把验收嵌进原来的归档题，而不是再问一轮。

### 需求: 一道四选题

lite 在全部任务完成后 MUST 只问一次，选项恰好为：验收再归档、直接归档、只验收、先不动。

#### 场景: 不会连问两次

- **GIVEN** lite 刚勾完最后一项
- **WHEN** 出现收尾问题
- **THEN** 只有这一道选择题
- **AND** 选项不超过 4 个

### 需求: 直接归档跳过验收

用户选择直接归档时，skill MUST 归档且 MUST NOT 创建 `acceptance/`。

#### 场景: 小修复直接收工

- **GIVEN** 用户选择直接归档
- **WHEN** lite 执行归档
- **THEN** 变更进入 archive
- **AND** 其中没有 `acceptance/`

### 需求: 验收再归档要等人接受

用户选择验收再归档时，skill MUST 跑完 acceptance 并等到决定为 accepted 才归档。若人提交待修改（`rejected`），MUST NOT 归档。

#### 场景: 提交待修改不会被顺手归档

- **GIVEN** 用户选了验收再归档
- **AND** 人在页上点了「让 AI 修改」
- **WHEN** skill 读到 rejected
- **THEN** 变更仍留在 changes/
- **AND** 根据待修改项进入修复

### 需求: 只验收不归档

用户选择只验收时，skill MUST 执行 acceptance，MUST NOT 调用 archive。

#### 场景: 页出来了但还在 changes

- **GIVEN** 用户选择只验收
- **WHEN** 人已接受
- **THEN** `acceptance/` 存在且 decision 为 accepted
- **AND** 变更仍在 `marchen/changes/`
