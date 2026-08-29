## 目的

约定变更目录下 `acceptance/` 的文件布局，以及轮次证据与人签核如何分开存放。

### 需求: 附属目录而不是 schema 制品

系统 MUST 把 `acceptance/` 当作变更目录里的附属夹，MUST NOT 把它登记为 schema artifact。`marchen new` MUST NOT 创建空的 `acceptance/`。

#### 场景: 新建变更没有验收夹

- **GIVEN** 已初始化的工作区
- **WHEN** 用户执行 `marchen new some-change`
- **THEN** `marchen/changes/some-change/` 下不存在 `acceptance/`
- **AND** `marchen status some-change` 的 artifacts 列表不含 `acceptance`

### 需求: 标准布局

当验收已经开始，`acceptance/` MUST 包含：`index.html`、`requirement.md`、`decision.json`、`rounds/<n>/`。每一轮目录 MUST 包含 `result.json`、`report.md`、`assets/`。人在待修改项里插入的图片 MUST 落在 `decision-assets/`。

#### 场景: 第一轮落盘后的树

- **GIVEN** 变更 `foo` 已完成第一轮取证
- **WHEN** 查看 `marchen/changes/foo/acceptance/`
- **THEN** 存在 `index.html`、`requirement.md`、`decision.json`、`rounds/1/result.json`、`rounds/1/report.md`、`rounds/1/assets/`

### 需求: 验收目标不可变且保持 Markdown

`requirement.md` MUST 在第一轮创建时写入一句验收目标，MUST 为 Markdown 文本。后续轮次 MUST NOT 改写该文件。系统 MUST NOT 把验收目标改存为 JSON。

#### 场景: 第二轮不改目标

- **GIVEN** `requirement.md` 已写入一句目标
- **WHEN** 因打回而创建 `rounds/2/`
- **THEN** `requirement.md` 的正文与第一轮时相同

### 需求: 轮次不可变

已经存在的 `rounds/<n>/` MUST NOT 在后续轮次中被覆盖。修复后再验 MUST 使用下一个整数编号的新目录。

#### 场景: 打回后开新轮

- **GIVEN** `rounds/1/` 已有截图与 `result.json`
- **WHEN** 人打回后再次取证
- **THEN** 新建 `rounds/2/`
- **AND** `rounds/1/` 下的文件内容保持不变

### 需求: 人的决定是 JSON，与模型自评分开

人的整单决定 MUST 写在 `decision.json`，状态 MUST 为 `pending`、`accepted` 或 `rejected` 之一。`items` MUST 为待修改项数组，每项 MUST 含 `id`、`comment`，MAY 含 `images`（相对路径）。模型在 `result.json` 里的结论 MUST NOT 覆盖 `decision.json`。

#### 场景: 模型 pass 人仍可打回

- **GIVEN** 最新一轮 `result.json` 的结论为 pass
- **AND** `decision.json` 状态为 pending
- **WHEN** 人将 `decision.json` 写成 rejected 且 items 非空
- **THEN** `result.json` 仍为 pass
- **AND** 归档预检读取的是 `decision.json` 的 rejected

### 需求: 接受与打回的写入前提

写成 `accepted` 时 `items` MUST 为空。写成 `rejected` 时 `items` MUST 非空，且每项 `comment` 去空白后 MUST 非空。`rejected` 表示人已提交待修改列表、要 AI 修改，MUST NOT 再表示「整单一句评语打回」。

#### 场景: 有待修改不能接受

- **GIVEN** `decision.json` 的 items 里已有一项
- **WHEN** 请求把 status 写成 accepted
- **THEN** 写入被拒绝
- **AND** 磁盘上的 status 仍不是 accepted

#### 场景: 空待修改不能让 AI 修改

- **GIVEN** `decision.json` 的 items 为空
- **WHEN** 请求把 status 写成 rejected
- **THEN** 写入被拒绝
- **AND** 磁盘上的 status 仍不是 rejected

### 需求: 案例标识跨轮稳定

同一个可验收目标在后续轮次中 MUST 复用原有 `plan[].id` / `cases[].id`。新出现的目标 MAY 使用新 id；已经移除的目标 MUST 只保留在历史轮次。系统 MUST 使用该 id 关联各轮模型结果和人工意见。

#### 场景: 修复后仍能关联上一轮意见

- **GIVEN** 第一轮案例 id 为 `login-submit` 且人已留下修改意见
- **WHEN** 修复后创建第二轮同一验收目标
- **THEN** 第二轮仍使用 `login-submit`
- **AND** 页面能把第一轮意见显示在该案例历史中

### 需求: 新轮保存并重置人的决定

开新一轮取证之前，系统 MUST 把当时的 `decision.json` 复制为该旧轮目录下的 `human-decision.json`。只有复制成功后，才 MUST 把根上的 `decision.json` 重置为 `status` 为 `pending` 且 `items` 为空。读取历史遗留轮次时，系统 MUST 允许 `human-decision.json` 缺失，并把它解释为该轮没有可展示的人工记录。

#### 场景: 修完再出示时待修改被清空

- **GIVEN** `decision.json` 为 rejected 且 items 非空
- **WHEN** 创建 `rounds/2/` 并开始新一轮出示
- **THEN** 根上 `decision.json` 的 status 为 pending
- **AND** 根上 items 为空
- **AND** `rounds/1/` 的证据文件未被改写

#### 场景: 保存上一轮失败时不清空决定

- **GIVEN** 根上 `decision.json` 为 rejected 且 items 非空
- **WHEN** 复制到旧轮 `human-decision.json` 失败
- **THEN** 不创建新轮
- **AND** 根上的 rejected 状态与 items 保持不变

### 需求: 证据只接受图片

`rounds/<n>/assets/` 与 `decision-assets/` MUST 只存放图片。系统 MUST NOT 把视频文件当作验收证据或待修改附图写入这些目录。

#### 场景: 不把录像当证据

- **GIVEN** 某一轮正在落盘证据
- **WHEN** 取证结束
- **THEN** `assets/` 中没有 video MIME 的文件
- **AND** 清单项若需要画面，使用的是截图

### 需求: 归档带走整夹

归档 MUST 把整个 `acceptance/` 随变更目录移入 archive，MUST NOT 丢弃 `assets/` 或 `decision-assets/` 中的证据文件。

#### 场景: 归档后证据还在

- **GIVEN** 变更含 `acceptance/rounds/1/assets/cron.png`
- **WHEN** 执行 `marchen archive <name>`
- **THEN** 对应 archive 目录下仍存在该 png
- **AND** `changes/<name>/` 不再存在
