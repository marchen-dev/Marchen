## 目的

用一份冻死的 HTML 给人看证据、在服务活着时逐项打回并整单签字。现场靠接口更新画面；关服务后靠烤进页里的快照阅读。

### 需求: 模型不得手写页面

`index.html` MUST 由模版灌数据生成。Skill 或模型 MUST NOT 自由撰写该文件的结构和样式。模版 MUST 来自验收页应用的构建产物，而不是会话里临时拼的 HTML。

#### 场景: 取证只改数据

- **GIVEN** 模版已随 CLI 发布
- **WHEN** skill 完成一轮取证
- **THEN** 变更目录里的 `index.html` 来自对该模版的灌入
- **AND** 没有由模型新写的布局骨架

### 需求: 无服务则隐藏写入控件

页面加载时 MUST 先请求 `GET /health`。失败、超时或页面以 `file://` 打开时，所有会改决定的按钮 MUST 保持不显示。按钮 MUST 默认隐藏，MUST NOT 先出现再消失。

#### 场景: 双击历史页没有接受按钮

- **GIVEN** 已归档变更的 `acceptance/index.html`
- **WHEN** 用户以 `file://` 打开它
- **THEN** 看不见「接受交付」或「让 AI 修改」或「打回修改」
- **AND** 仍能看见已烤进去的证据和结论

#### 场景: localhost 且服务在才露按钮

- **GIVEN** 用户打开 serve 打印的 URL
- **AND** GET /health 成功
- **AND** 当前决定为 pending
- **WHEN** 页面完成探测
- **THEN** 显示与待修改是否为空相符的写入控件

### 需求: 现场以 decision 接口为真相

服务活着时，页面 MUST 用 `GET /decision` 读取当前签核。用户提交后 MUST 用 `POST /decision` 写入。成功后页面 MUST 用响应更新画面，MUST NOT 整页刷新。

#### 场景: 点接受不刷新

- **GIVEN** 页面已显示按钮，状态为 pending，待修改为空
- **WHEN** 用户点接受且 POST 成功
- **THEN** 只读区变为已接受
- **AND** 页面没有重新加载

#### 场景: 刷新 localhost 仍看到刚写下的决定

- **GIVEN** POST 已把决定写成 accepted
- **WHEN** 用户刷新同一 serve URL
- **THEN** GET /decision 返回 accepted
- **AND** 页面显示已接受

### 需求: POST 成功后烤页

`POST /decision` 在写入 `decision.json` 之后 SHOULD 再次灌 `index.html`，使其中的结论与 `decision.json` 一致。烤失败 MUST NOT 把本次 POST 变成失败。

#### 场景: 关服务后再打开能看到已接受

- **GIVEN** 用户已在页上接受，POST 成功且烤页成功
- **WHEN** 停止 serve 并以 `file://` 打开 `index.html`
- **THEN** 正文显示已接受
- **AND** 没有写入按钮

#### 场景: 烤失败不影响这次点击

- **GIVEN** POST 已写入 accepted
- **AND** 灌页失败
- **WHEN** 当前标签页处理响应
- **THEN** 页面仍显示已接受
- **AND** HTTP 状态视为成功

### 需求: Sidebar 导航当前验收项

桌面页面 MUST 用左侧 Sidebar 列出当前轮的验收项，并标出各项模型结论和是否已进入待修改。选择一项时，正文 MUST 只展示该项的完整证据与记录。窄屏下 Sidebar MUST 收入可打开的 Sheet，MUST NOT 挤压正文形成多列小卡片。

#### 场景: 从 Sidebar 切换验收项

- **GIVEN** 当前轮包含两个验收项
- **WHEN** 用户在 Sidebar 选择第二项
- **THEN** 正文展示第二项的证据、AI 检查和验收记录
- **AND** 第一项的详情不再占据正文

### 需求: 证据查看支持多图与原始尺寸

同一验收项有多张截图时，页面 MUST 允许逐张切换。用户 MUST 能全屏查看，并能在适应窗口和原始尺寸之间切换。没有截图时 MUST 显示明确空态，MUST NOT 用空白大画布冒充证据。

#### 场景: 查看截图细节

- **GIVEN** 当前项包含两张截图
- **WHEN** 用户切换到第二张并选择原始尺寸
- **THEN** 查看器显示第二张图片的原始尺寸视图
- **AND** 用户可以退出并回到当前验收项

### 需求: 逐项意见进待修改

写入控件 MUST 允许针对当前验收项提交一条人工意见：正文保存为 Markdown 文本，MAY 附图片。编辑器 MUST 提供「编辑 / 预览」并支持选择、粘贴或拖入图片；图片 MUST 作为 `images[]` 附件保存，MUST NOT 伪装成可在段落中任意排版的 WYSIWYG。提交后该项 MUST 出现在待修改列表。整单仍为 pending 时，该意见 MUST 可以继续编辑或撤回。

#### 场景: 打回一项后出现在待修改

- **GIVEN** 按钮已显示，某项尚未在待修改中
- **WHEN** 用户为该项填写评语并确认打回
- **THEN** 待修改列表出现该项及其评语
- **AND** 整单 status 仍为 pending

#### 场景: 预览 Markdown 与图片附件

- **GIVEN** 用户正在填写当前项意见
- **WHEN** 用户输入 Markdown、粘贴一张图片并切到预览
- **THEN** 页面显示经过安全处理的 Markdown 预览
- **AND** 图片显示为该意见的附件

#### 场景: 打回必须写理由

- **GIVEN** 按钮已显示
- **WHEN** 用户不填评语就确认打回某一项
- **THEN** 该项不进入待修改
- **AND** 页面提示需要评语

#### 场景: 待修改可撤回

- **GIVEN** 待修改列表已有一项，整单仍为 pending
- **WHEN** 用户撤回该项
- **THEN** 该项从待修改列表消失
- **AND** 整单 status 仍为 pending

### 需求: 修改清单按需打开

页面 MUST 通过 Sheet 或 Drawer 集中展示所有待修改项，MUST NOT 使用固定右侧栏长期占据正文宽度。清单 MUST 允许跳回对应验收项，并在整单仍为 pending 时编辑或撤回该项。

#### 场景: 从修改清单定位原项

- **GIVEN** 两个验收项已进入待修改
- **WHEN** 用户在修改清单中选择其中一项
- **THEN** Sheet 或 Drawer 关闭
- **AND** 正文定位到该验收项及其人工意见

### 需求: 整单接受与让 AI 修改互斥

待修改为空时，页面 MUST 提供「接受交付」，MUST NOT 提供「让 AI 修改」。待修改非空时，页面 MUST 提供「让 AI 修改」，MUST NOT 提供「接受交付」。页面 MUST NOT 提供整单打回。点「让 AI 修改」MUST POST `rejected` 且带上当前待修改项。点「接受交付」MUST POST `accepted` 且 items 为空。

#### 场景: 有待修改不能整单接受

- **GIVEN** 待修改列表非空，服务活着
- **WHEN** 查看写入区
- **THEN** 看不见可用的「接受交付」
- **AND** 看得见「让 AI 修改」

#### 场景: 没有待修改才能接受

- **GIVEN** 待修改列表为空，服务活着，status 为 pending
- **WHEN** 查看写入区
- **THEN** 看得见「接受交付」
- **AND** 看不见「让 AI 修改」

#### 场景: 没有整单打回

- **GIVEN** 服务活着，按钮已显示
- **WHEN** 查看写入区
- **THEN** 不存在不针对某一项的整单「打回」按钮

### 需求: 模型结论不挡住人接受

页面 MUST 展示模型对单项的 通过 / 未通过 / 受阻。这些结论 MUST NOT 单独禁用「接受交付」。只要待修改为空，人 MUST 仍能整单接受。

#### 场景: 模型未通过仍可接受

- **GIVEN** 最新一轮某项模型结论为未通过或受阻
- **AND** 待修改列表为空
- **AND** 服务活着，status 为 pending
- **WHEN** 查看写入区
- **THEN** 「接受交付」可用

### 需求: 已终态则不再写入

整单为 `accepted` 或 `rejected` 时，页面 MUST 隐藏全部写入控件。新的一轮把决定重置为 pending 之后，写入控件才可再次出现。

#### 场景: 提交让 AI 修改后不能再改待修改

- **GIVEN** 用户已点「让 AI 修改」且 POST 成功
- **WHEN** 页面用响应更新
- **THEN** 看不见打回、撤回、接受或再次「让 AI 修改」
- **AND** 只读区显示已提交待修改

### 需求: 跨轮展示 AI 与人工验收记录

页面 MUST 提供轮次选择。当前验收项的历史区 MUST 按稳定 case id 串联各轮记录，并展示该轮 AI 结论、检查说明，以及 `human-decision.json` 中匹配该 id 的人工意见和附件。旧轮次 MUST 只读且默认折叠。某轮没有 `human-decision.json` 时页面 MUST 显示无人工记录的缺省态，MUST NOT 加载失败。

#### 场景: 下一轮看到上一轮打回理由

- **GIVEN** 第一轮的 `human-decision.json` 包含当前 case id 的意见和图片
- **AND** 页面正在查看第二轮同一 case id
- **WHEN** 用户展开第一轮记录
- **THEN** 看见第一轮 AI 检查和人工打回理由
- **AND** 看见对应图片附件

#### 场景: 老数据缺少人工记录仍可阅读

- **GIVEN** 某个历史轮次没有 `human-decision.json`
- **WHEN** 用户展开该轮记录
- **THEN** 页面仍展示该轮 AI 检查
- **AND** 人工记录位置显示无记录的缺省态

### 需求: 证据用相对路径

页面引用的截图与待修改附图 MUST 使用相对 `index.html` 的路径，以便 `file://` 下仍能显示。

#### 场景: 离线打开看得到图

- **GIVEN** `rounds/1/assets/cron.png` 存在且已被烤进页
- **WHEN** 以 `file://` 打开 `index.html`
- **THEN** 该图能显示
- **AND** 不请求 `127.0.0.1`

### 需求: 页面语言为中文

模版面向用户的文案 MUST 使用中文。

#### 场景: 中文控件

- **GIVEN** 服务活着、按钮已显示
- **WHEN** 查看写入区
- **THEN** 控件文案为中文（例如接受交付、打回修改、让 AI 修改、待修改）

### 需求: 页面使用克制的 shadcn 黑白视觉

页面 MUST 使用 shadcn 组件组合交互，并以黑、白、灰语义 token 构成主要视觉。页面 MUST NOT 使用渐变、暖色大底、指标卡片墙或无意义胶囊标签表达层级。

#### 场景: 页面层级由结构而非装饰表达

- **GIVEN** 验收页已载入多个案例和状态
- **WHEN** 用户查看整体页面
- **THEN** Sidebar、正文和按需 Sheet 的层级清晰
- **AND** 页面没有用一组统计卡片重复展示相同状态
