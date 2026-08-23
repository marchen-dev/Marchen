## 目的

归档前让人知道有没有签核，但不拿验收卡住收工。

### 需求: 缺决定时警告

archive skill 在执行 `marchen archive` 之前 MUST 查看该变更的验收决定。若没有 `decision.json`，或状态不是 accepted，MUST 警告并请求确认。用户确认后 MUST 仍可归档。

#### 场景: pending 也能强行归档

- **GIVEN** `decision.json` 为 pending
- **WHEN** 用户调用 archive
- **THEN** 先看到警告
- **AND** 用户确认后变更被归档

#### 场景: 已接受则不为此警告

- **GIVEN** `decision.json` 为 accepted
- **WHEN** 用户调用 archive
- **THEN** 不出现「尚未签核」类警告
- **AND** 照常归档

### 需求: lite 已声明跳过则不再啰嗦

若本次归档来自 lite 收尾且用户选了「直接归档」，archive 路径 MUST NOT 再问一遍「尚未验收」。

#### 场景: 直接归档不问第二次

- **GIVEN** lite 用户刚选择直接归档
- **WHEN** 执行归档
- **THEN** 不再弹出尚未签核的确认
- **AND** 变更被归档

### 需求: 归档前尽量停 serve

archive 开始前 SHOULD 停止本工作区的 acceptance serve，避免归档挪走目录后面端口空转。

#### 场景: 归档后原端口不再服务该变更

- **GIVEN** 该变更的 serve 正在运行
- **WHEN** 归档完成
- **THEN** 原 URL 不再提供该变更的验收页
