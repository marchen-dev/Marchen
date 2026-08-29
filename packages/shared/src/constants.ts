/** 规范目录名称 */
export const SPEC_DIRECTORY_NAME = 'marchen'

/** 变更目录名称 */
export const CHANGE_DIRECTORY_NAME = 'changes'

/** 归档目录名称 */
export const ARCHIVE_DIRECTORY_NAME = 'archive'

/** 尚未晋升的想法目录名称 */
export const IDEA_DIRECTORY_NAME = 'ideas'

/** 正式变更内的探索背景目录名称 */
export const EXPLORATION_DIRECTORY_NAME = 'exploration'

/** Idea Markdown 当前格式版本 */
export const IDEA_FORMAT_VERSION = 1

/** 元数据文件名常量 */
export const METADATA_FILE_NAME = '.metadata.yaml'

/** 工作区配置文件名 */
export const CONFIG_FILE_NAME = 'config.yaml'

/** 变更目录下的验收附属夹 */
export const ACCEPTANCE_DIRECTORY_NAME = 'acceptance'

/** 验收目标（第一轮写下后不可改） */
export const ACCEPTANCE_REQUIREMENT_FILE = 'requirement.md'

/** 人的整单签核 */
export const ACCEPTANCE_DECISION_FILE = 'decision.json'

/** 旧版整单签核（只读兼容） */
export const ACCEPTANCE_LEGACY_DECISION_FILE = 'decision.md'

/** 待修改项附图目录 */
export const ACCEPTANCE_DECISION_ASSETS_DIRECTORY = 'decision-assets'

/** 单张待修改附图上限（字节） */
export const ACCEPTANCE_DECISION_ASSET_MAX_BYTES = 5 * 1024 * 1024

/** 灌好的离线页 */
export const ACCEPTANCE_PAGE_FILE = 'index.html'

/** 轮次目录 */
export const ACCEPTANCE_ROUNDS_DIRECTORY = 'rounds'

/** serve 锁：pid / port / token */
export const ACCEPTANCE_SERVE_LOCK_FILE = '.serve.pid'

/** 默认回环端口，占用则 7421–7430 */
export const ACCEPTANCE_DEFAULT_PORT = 7420

/** 端口尝试上限（含默认） */
export const ACCEPTANCE_MAX_PORT = 7430
