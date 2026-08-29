## 背景

CLI 全是短命令，逻辑在 core，文件走 fs。变更目录只有 proposal / specs / design / tasks；`archive` 整夹搬走。`review` 是纯 skill：对照 diff，可选 chrome-devtools，报告留在聊天里。

验收需要人看图、留下决定，并且半年后还能打开。这和「再写一个 skill 打勾」不是同一类问题：要有冻住的页、本机签字口、以及不进 schema 的附属目录。

v1 已经落地了 serve / 灌页 / `decision.md` 整单接受打回。人签核要从整单评语改成逐项待修改，决定文件改 JSON。首版页面采用 lightbox 审查队列，但它无法清楚承载案例导航、跨轮记录和长意见编辑，因此改为 Sidebar + Issue 记录流 + 按需 Sheet 的结构。

## 目标与非目标

**目标：**

- 变更下有一份可归档的 `acceptance/`：轮次证据 + 人的决定 + 离线 HTML
- 本机窄 HTTP：只为签字，只绑回环
- 人逐项打回进待修改，批量「让 AI 修改」；没有待修改才能整单接受
- 人可在同一案例中对照截图、AI 检查和历轮人工决定，再填写本轮意见
- 验收页使用 shadcn 黑白视觉，并在桌面与窄屏上保持清晰的主次关系
- apply / lite 接到验收；review 入口消失
- 现场靠 GET/POST 更新画面；关服务后靠烤页阅读

**非目标：**

- 接 LobeHub / `lh` / 任何云账号
- 绑定 `0.0.0.0`、局域网预览
- 把 acceptance 登记为 schema artifact
- 点接受自动 archive
- 整单打回按钮
- 富文本编辑器（WYSIWYG）
- 录视频、把 `agent-browser` 做成依赖
- File System Access API、第三方 HTTP 框架
- 评论流、websocket、多人同时签
- 给 AI 自评分增加「不确定」档（维持 通过 / 未通过 / 受阻）

## 决策

### 1. 附属夹，不进 schema

`acceptance/` 在 apply 之后才出现。放进 schema 会让 `new` 铺空夹、`status` 把它当没填完的制品。归档已经 `moveDir` 整目录，夹在里面就会走。

预检「有没有决定」放在 archive **skill** 和 `marchen acceptance status`，不改 `ChangeManager.status` 的 artifact 列表。

### 2. 目录、决定文件、轮次

```
acceptance/
  index.html
  requirement.md         # 第一轮写下，之后不准改（Markdown，给人读）
  decision.json          # 人的整单状态 + 待修改项
  decision-assets/       # 待修改项附图，相对路径写进 json
  .serve.pid             # 本仓库 serve，不进阅读面
  rounds/
    1/result.json
    1/report.md
    1/assets/
    1/human-decision.json  # 开下一轮前把当时的 decision.json 抄过来
    2/...
```

轮次冻住：打回再验是 `rounds/2/`。模型结论在 `result.json`，人的当前结论在 `decision.json`。ingest 下一轮不得覆盖后者；开新轮前 skill 必须先把当前 `decision.json` 抄到本轮 `human-decision.json`，成功后再把根上的决定重置为 `pending` 且 `items` 为空。历史遗留轮次可以没有 `human-decision.json`，render 读取时按「无人留下决定」兼容，不能让整页失败。

`requirement.md` 保持 Markdown，不改 JSON：它是给人读的一句目标，不是给程序枚举的结构。

`decision.json` 最小形状：

```json
{
  "status": "pending",
  "items": [
    {
      "id": "login-submit",
      "comment": "主按钮对比度不够",
      "images": ["decision-assets/a1b2.png"]
    }
  ]
}
```

- `status`：`pending` | `accepted` | `rejected`
- `items`：待修改项。`id` 对齐最新一轮 `plan[].id` / `cases[].id`
- `images`：只存相对 `index.html` 的路径，落盘后的 JSON 不含 base64

同一个验收目标跨轮必须复用相同的 case id。新一轮新增的验收目标可以生成新 id；已删除目标只保留在历史轮次。页面依靠该 id 把历轮 AI 检查与人工意见串成同一案例记录。

写入规则：

| 要写成 | 前提 |
|---|---|
| `accepted` | `items` 必须为空 |
| `rejected` | `items` 非空，且每项 `comment` 去空白后非空 |
| `pending` | `items` 可空可满，用来边审边攒待修改 |

`rejected` 是 AI 开工的触发器，不是「整单一句话打回」。页面没有整单打回。

`result.json` 仍对齐 LobeHub 能用的那一层：`title`、`plan`、`cases`、`summary`、`commit`、`surfaces`。证据路径相对本轮 `assets/`。清单项必须是人能拍板的结果。模型单项结论只有 通过 / 未通过 / 受阻（JSON 里用既有 pass / fail / blocked 映射），页面照样展示；这些值不禁用「接受交付」。

证据只接受截图（png / jpeg / webp / gif）。不录视频，不在 `assets/` 或 `decision-assets/` 里存放 video MIME。

### 3. CLI 子命令组

```
marchen acceptance serve <name>  [--port] [--open] [--json]
marchen acceptance stop  [name]
marchen acceptance render <name> [--json]
marchen acceptance status <name> [--json]
```

不加 `accept`/`reject`/`init`：签字走页面，建夹由 skill 完成。

分层：cli 注册与打印；core 里 `AcceptanceManager`（读决策、render、serve 循环、pid）；文件只经 fs。

HTTP 用 `node:http`。默认端口 7420，占用则 7421–7430。每个工作区一份 pid：`acceptance/.serve.pid`。serve 的前提是已有变更的 acceptance 夹；没有夹就先 render。重复 `serve` 发现 pid 仍活着：打印旧 URL，不二次 listen。

人对着终端：默认前台，Ctrl+C 停并清 pid。skill：后台拉起 + `stop`。`--open` 默认打开系统浏览器。

### 4. HTTP 针孔

仅：

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/health` | 无副作用，不需 token |
| GET | `/decision` | 读 `decision.json`，需 token |
| POST | `/decision` | 写 `decision.json`（可顺带落附图），再烤页，需 token |
| GET | `/` 与相对静态 | 只出 `acceptance/` 以内 |

Token 在启动时生成，印在 `?t=`。页面脚本从查询串取出，带在 GET/POST `/decision`。缺 token 的 POST/GET decision 返回 401。静态页和 health 不需要，方便探测「服务在不在」。

POST 体是一份决定，另可附尚未落盘的图：

```json
{
  "status": "pending" | "accepted" | "rejected",
  "items": [
    {
      "id": "login-submit",
      "comment": "主按钮对比度不够",
      "images": ["decision-assets/a1b2.png"],
      "newImages": [
        { "mime": "image/png", "data": "<base64>" }
      ]
    }
  ]
}
```

服务把 `newImages` 写到 `acceptance/decision-assets/<生成名>`，允许的 MIME 仅 `image/png`、`image/jpeg`、`image/webp`、`image/gif`，单张上限 5MB。落盘后的 `decision.json` 只保留相对路径，不含 `newImages` 也不含 base64。非法 MIME、超限、空 comment 的 rejected、带 items 的 accepted → 400，文件不变。

禁止写 `decision.json` 与 `decision-assets/` 以外任何路径。静态根死死钉在该变更的 `acceptance/`。成功后调用与 `render` 相同的灌页；烤失败只记日志，HTTP 仍 200（磁盘上的 decision 已是真相）。

不另开 `/asset` 端点，避免 HTTP 表面变宽。

### 5. 验收页：构建产物 + Sidebar / Issue 记录流

页面源码在 `packages/acceptance-ui`（Vite + React + shadcn / Base UI）。它 **不是** CLI 运行时依赖：`vite-plugin-singlefile` 打出一份 `dist/index.html`，`@marchen/config` 的 generate 把它烘焙成 `ACCEPTANCE_PAGE_TEMPLATE` 字符串，和 skill 模版同一套路。core `render` 只灌数据，不在运行时找 React。

模版里必须有：

```html
<script type="application/json" id="acceptance-data"></script>
```

render 把 requirement、decision、各轮 JSON 写成该节点的文本。每轮数据除 `result.json` 外，还带可选的 `humanDecision`；它来自同轮 `human-decision.json`，缺失时为 `null`。图用 `rounds/1/assets/...`、`decision-assets/...` 相对路径。

交互（写入控件仅 localhost + health 成功时出现）：

1. 顶栏展示变更名、当前轮次、整单状态和轮次选择；切到旧轮次时整页只读
2. 桌面端左侧 Sidebar 列出验收项、AI 状态和待修改标记；它只负责导航，不承载第二套详情
3. 中央当前项依次展示截图证据、AI 检查说明、跨轮验收记录、本轮人工意见编辑器，不做仪表盘网格或卡片墙
4. 证据区支持多图切换、全屏查看，以及适应窗口 / 原始尺寸；缺图时给出明确空态
5. 历史记录按轮次倒序、默认折叠，显示该轮 AI 结论和 `human-decision.json` 中匹配当前 case id 的人工意见与附件
6. 本轮每项只有一条当前人工意见，可编辑、可撤回；编辑器采用 Markdown 文本的「编辑 / 预览」双态，图片通过选择、粘贴或拖入成为附件，不做 WYSIWYG，也不做多人评论流
7. 已加入的项进入整单「修改清单」；桌面与移动端均通过按需打开的 Sheet / Drawer 查看，不保留固定右侧栏
8. 待修改非空 → 主操作打开修改清单，并在清单中确认「让 AI 修改」，POST `rejected`
9. 待修改为空 → 显示「接受交付」，经确认后 POST `accepted`
10. 没有整单打回；模型的 通过 / 未通过 / 受阻只展示，不禁用接受
11. `accepted` / `rejected` 后隐藏写入控件；新轮把决定重置为 pending 后再露出
12. POST 成功用响应更新画面，不 `location.reload()`

窄屏下，案例 Sidebar 收进左侧 Sheet，修改清单使用底部 Drawer 或全宽 Sheet；正文始终只有一列，证据和意见区不横向挤压。

`file://` 下 health 必然失败，写入控件默认 `hidden`，MUST NOT 先出现再消失。历史页只读。这是刻意的。

视觉：以 shadcn 的黑、白、灰语义 token 为基础，正文白底、近黑字、低对比度分隔线，状态只用图标、字重和克制的灰阶区分。系统中文栈。禁止 Claude 杏黄 / 陶土、渐变、报纸排版、指标卡片墙和无意义胶囊标签。

页面脚本：

1. 写入区默认 `hidden`
2. `fetch('/health')`，失败或 `file://` → 保持隐藏，展示嵌进去的快照
3. 成功 → 用 token `GET /decision`，显示控件并与磁盘对齐
4. 每加一项 / 撤回 / 接受 / 让 AI 修改都走 POST

### 6. Skill 流程

`disable-model-invocation: true`。

顺序：预检（`status` + `acceptance status` + diff 是否空）→ 写/更新 `rounds/n` → `render` → `serve --open` → 轮询 `acceptance status --json` 或 `GET /decision`，直到不是 pending 或用户打断。

禁止用浏览器点接受或「让 AI 修改」。没有 chrome-devtools 就把 UI 项标 blocked，不装 `agent-browser`，不假装截过图。证据只截图。

读到 `rejected`：按 `items[].comment` 和附图改代码，不得归档。修完开新轮：把当时的 `decision.json` 抄到本轮 `human-decision.json`，确认保存成功后再重置根上决定为 `{ "status": "pending", "items": [] }` 并取证。读到 `accepted`：询问是否归档，无人确认不得自动归档。

apply.md 收尾从「可以 review」改成 MUST 走上述流程。一进来已 all_done 且 accepted → 只提示 archive。

lite 一道题四选项，见 spec。

### 7. 删除 review

从 `packages/config/templates/skills/review.md` 与 `commands/review.md` 删除，重跑 generate。apply / lite / archive / update / propose 完成提示、README 里的 review 改成 acceptance。

`update` 扫描已知工具目录，删除 Marchen 生成的 `review.md`（只删我们当初写下的那几个固定相对路径，不扫用户自建文件）。

代码对照不单独做入口：acceptance 预检读 `marchen status`，严重跑偏写 `report.md`，不上 HTML 清单。

## 风险与权衡

- **Agent 代点。** 按钮只在 localhost+token 时出现。skill 写死禁止点击。这是约定不是沙箱；token 主要防本机其它页乱 POST。
- **孤儿进程。** pid + `stop` + archive 前 stop。skill 崩了可能留下监听，再次 serve 复用或 `stop` 清掉。
- **烤失败。** 现场已用 GET 更新；历史页可能暂时仍写 pending。补救：下次 serve/render 再烤。不把烤失败当签字失败。
- **截图体积。** 证据进 git。search 只应吃 md；实现时 render/索引不要去啃 png。
- **十个工具的 MCP 不一致。** 取证降级为 blocked，总比假装截过图好。
- **待修改附图。** 用 POST 附带 base64 而不是第二端点，HTTP 仍窄；单张 5MB、禁 svg，避免当文件传输口。
- **历史决定缺失或案例 ID 漂移。** 旧轮允许没有 `human-decision.json`，页面展示缺省态；新轮必须复用已有 case id，并用测试保证同一案例的记录不会串线。
- **Markdown 预览引入脚本风险。** 预览只支持安全子集，HTML 必须转义或经过白名单净化；图片仍通过 `images[]` 附件保存，不解析正文里的任意外链标签。
- **历史轮次与图片让冻页变大。** 默认只展开当前轮记录，历史证据按用户操作显示；仍坚持单文件模版加相对图片，不引入远程资源。
- **长驻进程打破「命令都是一次性」。** 范围锁死：一个子命令组、一个端口序列、三个 HTTP 动词。发胖（多人评论、热更新、录像）一律拒绝。
- **验收页依赖。** React 只存在于 `acceptance-ui` 构建期。CLI 运行时仍是烤好的字符串。generate 时若缺 `dist/index.html` 必须失败并提示先 build 该包。
