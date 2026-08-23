## 动机

apply 做完之后，人没法对着截图签核。原来的 `marchen-review` 能对照 spec 点页面，但报告留在聊天里，会话一关就没了；归档也看不到「人到底收没收」。

LobeHub 的 acceptance 把这件事做成了带证据的验收页。Marchen 要同一件事，但必须留在本地文件里：不登录、不接 `lh`，跟着变更目录归档。

整单「接受 / 打回」不够用。人需要对着每一项证据决定要不要打回，把理由和附图攒进待修改列表，再一次性让 AI 改；没有待修改时才能整单接受。模型自评分（通过 / 未通过 / 受阻）只是出示，不能挡住人接受。

名字就叫 acceptance，和 LobeHub 对齐，方便模型走熟路。删掉 review 入口，避免「又 review 又验收」。

## 变更内容

- 新增 `acceptance/` 目录约定：轮次证据、人的决定、一份可双击打开的 HTML
- 新增 CLI 子命令组：`serve` / `stop` / `render` / `status`。本机只绑 127.0.0.1，给人在页上写决定
- 人的决定存 `decision.json`（整单状态 + 待修改项）；附图进 `decision-assets/`。`requirement.md` 仍是人读的验收目标，第一轮写下后不准改
- 验收页是冻死的单文件 HTML：来自 `packages/acceptance-ui` 的构建产物，灌数据后写出。服务活着才显示写入控件；现场走 GET/POST，不整页刷新；成功后烤页，供以后 `file://` 阅读
- 交互：左侧 Sidebar 选验收项，中央按「截图证据 → AI 检查说明 → 历史验收记录 → 人工修改意见」阅读；人工意见采用 GitHub Issues 式 Markdown 编辑/预览并支持图片附件，可编辑、可撤回
- 待修改集中在按需打开的 Sheet 中；「让 AI 修改」把整单标成 `rejected`，待修改为空才能「接受交付」。没有整单打回。证据只接受截图，不录视频
- 验收页使用 shadcn 黑白视觉；历史轮次只读，并按稳定案例 ID 展示当轮 AI 结果与人的决定
- 新增 `marchen-acceptance` skill：取证、写轮次、拉起 serve、轮询决定。`disable-model-invocation`，只由 apply/lite 收尾或人显式调用
- 删除 `review` skill 与 command；apply 勾完直接走进 acceptance；lite 用一道题问要不要验收；archive 没决定只警告

不把 acceptance 做成 schema artifact，`marchen new` 不铺空夹。不把 `agent-browser` 做成 Marchen 依赖。

## 能力

### 新增能力

- `acceptance-layout`：变更目录下 `acceptance/` 的文件布局、`result.json` / `decision.json` 的含义、轮次不可变
- `acceptance-cli`：`marchen acceptance` 子命令组，本机 HTTP 针孔，只写 `decision.json` 与 `decision-assets/`
- `acceptance-page`：验收页的只读/可写两态、逐项待修改与整单签字、health、decision 接口、烤页
- `acceptance-skill`：取证与预检、apply 自动接力、lite 询问、禁止代点、禁止模型闲触发
- `retire-review`：删除 review 模板，并改掉所有指向它的下一步文案

### 修改能力

- `apply-skill`：全部任务完成后 MUST 执行 acceptance，不再提示 review
- `lite-skill`：完成题改为验收/归档四选一
- `archive-skill`：无决定或仍为 pending 时警告，不阻塞

## 影响范围

- `apps/cli`：注册 `acceptance` 子命令
- `packages/core`：serve、render、读写真相文件、回灌各轮人工决定
- `packages/shared`：决定状态、待修改项类型、路径常量
- `packages/fs`：只通过它碰文件
- `packages/acceptance-ui`：验收页 React 源码，使用 shadcn 组合 Sidebar、证据查看器、Issue 式意见区和修改清单 Sheet，构建为单文件 HTML；不是 CLI 运行时依赖
- `packages/config`：烘焙后的 HTML 模版、新 skill/command、删 review、改 apply/lite/archive/propose 文案
- `marchen init` 之后各 AI 工具拿到的 skill 文件
- CLI 运行时不新增 npm 依赖（HTTP 用 `node:http`）。验收页包自有构建依赖
