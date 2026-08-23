## 目的

提供 `marchen acceptance` 子命令组，在本机起一个只写决定文件的 HTTP 针孔，并灌出可离线打开的 HTML。

### 需求: 子命令组

CLI MUST 提供 `acceptance serve`、`acceptance stop`、`acceptance render`、`acceptance status`。上述命令 MUST 支持 `--json` 输出供 skill 消费。

#### 场景: 帮助里能看到子命令

- **GIVEN** 已安装 marchen CLI
- **WHEN** 用户执行 `marchen acceptance --help`
- **THEN** 输出包含 serve、stop、render、status

### 需求: serve 只绑回环

`acceptance serve <name>` MUST 监听 `127.0.0.1`。它 MUST NOT 绑定 `0.0.0.0`。默认端口 MUST 为 7420；若被占用 MUST 依次尝试 7421 至 7430，仍失败则 MUST 以非零退出。

#### 场景: 监听地址是回环

- **GIVEN** 变更 `foo` 已有 `acceptance/`
- **WHEN** 执行 `marchen acceptance serve foo`
- **THEN** 进程监听 `127.0.0.1` 上的某一端口（7420–7430）
- **AND** 从非本机地址无法连上

### 需求: 每个仓库同时只有一个 serve

同一工作区 MUST 最多运行一个 acceptance serve。再次 `serve` 时若已有存活进程，MUST 复用并打印已有 URL，MUST NOT 再开第二个监听。

#### 场景: 重复 serve 不占第二端口

- **GIVEN** `serve foo` 已在 7420 运行
- **WHEN** 再次执行 `marchen acceptance serve foo`
- **THEN** 仍只有一个监听
- **AND** 标准输出含同一 URL

### 需求: 启动打印带 token 的 URL

serve 启动成功后 MUST 打印 `http://127.0.0.1:<port>/?t=<token>`。未带正确 token 的 `POST /decision` MUST 被拒绝。

#### 场景: 无 token 不能写决定

- **GIVEN** serve 已启动
- **WHEN** 客户端不带 token 发送 POST /decision
- **THEN** 响应为 4xx
- **AND** `decision.json` 未被修改

### 需求: HTTP 表面极窄

serve 提供的 HTTP 接口 MUST 仅包括：`GET /health`、`GET /decision`、`POST /decision`，以及 `acceptance/` 目录以内的静态文件。`POST /decision` MUST 只允许写入该变更的 `acceptance/decision.json`，以及 `acceptance/decision-assets/` 下的图片文件。

#### 场景: 不能写夹外文件

- **GIVEN** serve 正在为变更 `foo` 运行
- **WHEN** 请求试图把路径指到 `tasks.md` 或 `../.env`
- **THEN** 请求失败
- **AND** 那些文件内容不变

#### 场景: 附图只进 decision-assets

- **GIVEN** serve 正在运行且 token 正确
- **WHEN** POST /decision 附带一张 png 的待修改项
- **THEN** 图片出现在 `acceptance/decision-assets/` 下
- **AND** `decision.json` 里的引用是相对路径而不是原始字节

### 需求: 拒绝非法附图与非法状态

`POST /decision` 在下列情况 MUST 返回 4xx 且 MUST NOT 改磁盘：`rejected` 但 items 为空或任一项 comment 为空；`accepted` 但 items 非空；附图 MIME 不是 png / jpeg / webp / gif；单张附图超过实现约定的上限。

#### 场景: 空待修改不能写成 rejected

- **GIVEN** serve 已启动
- **WHEN** 客户端 POST `{ "status": "rejected", "items": [] }`
- **THEN** 响应为 4xx
- **AND** `decision.json` 未被改成 rejected

### 需求: 缺页先灌再听

`serve` 在监听之前，若缺少 `index.html`，MUST 先执行与 `render` 相同的灌页。

#### 场景: 只有轮次没有 html 也能 serve

- **GIVEN** `acceptance/rounds/1/` 已有 `result.json` 但没有 `index.html`
- **WHEN** 执行 `acceptance serve`
- **THEN** 生成 `index.html` 后再监听
- **AND** GET `/` 返回该页

### 需求: stop 停掉本仓库的 serve

`acceptance stop` MUST 结束本工作区由 serve 记下的那个进程。进程不存在时 MUST NOT 以失败打扰（退出码 0，并说明没有在跑）。

#### 场景: stop 后 health 不通

- **GIVEN** serve 正在运行
- **WHEN** 执行 `marchen acceptance stop`
- **THEN** 原端口上的 GET /health 失败

### 需求: render 灌出离线页

`acceptance render <name>` MUST 根据 `requirement.md`、`decision.json` 和各轮 `rounds/<n>/` 生成 `acceptance/index.html`。图的引用 MUST 使用相对路径。

#### 场景: render 后双击能看到图

- **GIVEN** `rounds/1/assets/cron.png` 存在
- **WHEN** 执行 `acceptance render`
- **THEN** `index.html` 用相对路径指向该 png
- **AND** 不依赖 `http://127.0.0.1`

### 需求: status 报告验收进度

`acceptance status <name>` MUST 报告：目录是否存在、轮次数、`decision.json` 状态、serve 是否在跑。

#### 场景: 未开始验收

- **GIVEN** 变更没有 `acceptance/`
- **WHEN** 执行 `marchen acceptance status <name> --json`
- **THEN** JSON 标明目录不存在
- **AND** 决定状态视为缺失而不是 accepted

### 需求: 不引入第三方 HTTP 框架

实现 MUST 使用运行时所带的 HTTP 能力，MUST NOT 为此给 CLI 运行时增加新的 npm 依赖。验收页源码包的构建依赖 MUST NOT 变成 CLI 运行时依赖。

#### 场景: 包清单不出现新 HTTP 库

- **GIVEN** 本变更已实现
- **WHEN** 查看 CLI 与 core 的运行时依赖
- **THEN** 没有新增 express、fastify、hono 或同类框架
