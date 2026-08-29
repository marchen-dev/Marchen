## 目的

full 工作流在实现完毕后接到验收，而不是停在一句「可以去 review」。

### 需求: 首次全部完成后必须进入验收

apply skill 在任务从「未全部完成」变为「全部完成」时 MUST 立刻执行 acceptance 流程（落盘、灌页、serve、等人签核）。它 MUST NOT 只打印一句可选提示。

#### 场景: 勾完最后一项就出示

- **GIVEN** 变更还差最后一项任务
- **WHEN** apply 勾完该项
- **THEN** 开始 acceptance，而不是结束对话并等待用户另敲命令

### 需求: 已经验收通过则不再自动出示

apply 一进来就发现任务已全部完成、且 `decision.json` 已为 accepted 时，MUST 提示归档，MUST NOT 再开新轮或再起一套无意义的取证。

#### 场景: 重复 apply 不刷第二轮

- **GIVEN** 任务全勾完且 decision 为 accepted
- **WHEN** 用户再次调用 apply
- **THEN** 不创建 `rounds/2/`
- **AND** 提示可以使用 archive

### 需求: 打回后的再次 apply 开新轮

任务已全勾、decision 为 rejected，且代码已按待修改项修改时，再次收尾 MUST 开新的一轮取证，MUST NOT 改写旧轮文件。新轮出示前 MUST 把根上的决定重置为 pending 且 items 为空。

#### 场景: 修完再出示是新轮

- **GIVEN** `rounds/1/` 存在且 decision 为 rejected
- **WHEN** apply 或 acceptance 再次收尾
- **THEN** 出现 `rounds/2/`
- **AND** `rounds/1/` 内容不变
- **AND** 根上 `decision.json` 为 pending 且 items 为空
