## 目的

规定 agent 如何取证、落盘、拉起验收页，以及何时自动跑、何时必须等人。

### 需求: 禁止闲触发

`marchen-acceptance` skill MUST 设置禁止模型自行调用。它 MUST 只在 apply / lite 收尾按正文执行，或在用户显式 `/marchen:acceptance` 时执行。

#### 场景: 描述不会在实现中途被触发

- **GIVEN** 用户正在 `/marchen:apply` 实现某一任务
- **WHEN** 对话里出现「验证一下」「prove it works」之类句子但用户未显式调用 acceptance
- **THEN** agent MUST NOT 因此独自启动 acceptance 流程

### 需求: 预检不上验收清单

开始取证前，skill MUST 检查任务是否勾完、工作区是否有产品向改动。任务未完或没有可出示的改动时 MUST 询问是否继续或停止。单测、lint、类型检查、以及「某个 task 有对应 diff」MUST NOT 出现在 HTML 验收清单里。设计偏离 MAY 写进该轮 `report.md`。

#### 场景: 空 diff 不出页

- **GIVEN** 全部任务已勾选但工作区相对基线没有产品向改动
- **WHEN** 进入 acceptance
- **THEN** 不创建会误导人的验收清单项
- **AND** 向用户说明没有可出示的改动

### 需求: 清单必须是人能拍板的事

计划中的每一项 MUST 是人能看见、听见或拿到的结果。Skill MUST NOT 把构建是否通过写成验收项。

#### 场景: 不把 CI 绿写进清单

- **GIVEN** 变更包含前端页面
- **WHEN** skill 编写 `plan`
- **THEN** 清单项描述用户可观察的结果
- **AND** 没有任何一项以测试套件或 lint 通过为内容

### 需求: 后续轮次复用案例标识

Skill 为修复后的新轮生成 `plan` 和 `cases` 时，MUST 为同一个可验收目标复用上一轮 id。只有新增验收目标 MAY 生成新 id。Skill MUST NOT 因文案微调或排序变化替换已有 id。

#### 场景: 修改按钮后仍沿用原案例 id

- **GIVEN** 第一轮用 `login-submit` 验收登录按钮且人已打回
- **WHEN** AI 修改按钮后创建第二轮
- **THEN** 第二轮该目标仍使用 `login-submit`
- **AND** 新轮页面能关联第一轮人工意见

### 需求: 取证写入新轮

每一轮出示 MUST 写入新的 `rounds/<n>/`。已 accepted 且未再打回时 MUST NOT 再开新轮。状态为 rejected 后再出示 MUST 开下一轮，并在出示前先把根上的 `decision.json` 保存到旧轮 `human-decision.json`；保存成功后再重置为 pending 且 items 为空。

#### 场景: 已接受则不再开轮

- **GIVEN** `decision.json` 为 accepted
- **WHEN** 用户再次进入 acceptance
- **THEN** 不创建新的 `rounds/` 子目录
- **AND** 提示可以归档

### 需求: apply 勾完必须接力

full schema 的 apply 在全部任务首次勾完后 MUST 接着执行 acceptance：落盘第一轮、`render`、后台 `serve`、打开 URL、轮询 `GET /decision` 直到状态不再是 pending 或用户打断。

#### 场景: apply 结束后出现验收 URL

- **GIVEN** apply 刚勾完最后一项且尚无 acceptance 目录
- **WHEN** apply 进入收尾
- **THEN** 创建 `acceptance/rounds/1/`
- **AND** 标准输出或对话中出现 `127.0.0.1` 的验收 URL

#### 场景: 人提交待修改后 apply 会话继续修

- **GIVEN** 轮询读到 `decision.json` 为 rejected 且 items 非空
- **WHEN** skill 处理该结果
- **THEN** 不归档
- **AND** 根据各项 comment 与附图继续修改，并在修完后开新轮

#### 场景: 人接受后询问归档

- **GIVEN** 轮询读到 accepted
- **WHEN** skill 处理该结果
- **THEN** 询问用户是否归档
- **AND** MUST NOT 在无人确认时自动归档

### 需求: 禁止代点

Skill MUST NOT 操作验收页上的接受、打回修改或「让 AI 修改」控件，MUST NOT 用浏览器自动化提交 `POST /decision`。

#### 场景: 不替人点接受

- **GIVEN** serve 已启动且 URL 已打开
- **WHEN** skill 等待人签核
- **THEN** 它只轮询或等待用户在对话中打断
- **AND** 不点击页上的写入按钮

### 需求: 取证工具可降级且只截图

有浏览器自动化时，UI 项 SHOULD 附截图。没有时 MUST 把 UI 项标为 blocked，在 `report.md` 说明原因，MUST NOT 假装截过图。不要求安装额外的浏览器 CLI。Skill MUST NOT 把录像当作证据。

#### 场景: 没有浏览器工具就标明没验到

- **GIVEN** 当前环境没有可用的浏览器自动化
- **AND** 清单里有必须看页面的项
- **WHEN** 该轮结束
- **THEN** 该项状态为 blocked
- **AND** `report.md` 写明未截到图

### 需求: lite 用一道题接入

lite 全部任务完成后 MUST 用一道选择题，选项为：验收再归档、直接归档、只验收、先不动。选项 MUST NOT 超过 4 个。选「验收再归档」时 MUST 等决定变为 accepted 再归档；选「直接归档」MUST 不创建验收夹。

#### 场景: 直接归档不建夹

- **GIVEN** lite 任务全部完成
- **WHEN** 用户选择直接归档
- **THEN** 变更被归档
- **AND** 归档目录中没有 `acceptance/`

#### 场景: 验收再归档会等接受

- **GIVEN** 用户选择验收再归档
- **AND** 人尚未在页上接受
- **WHEN** skill 仍在等待
- **THEN** 变更还没有被归档
