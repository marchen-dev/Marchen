/**
 * Marchen 统一错误基类
 *
 * 所有业务错误的根类，CLI 层可用 instanceof MarchenError 兜底捕获
 */
export class MarchenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MarchenError'
  }
}

/**
 * 用户输入校验错误
 *
 * 名称不合法、变更已存在/不存在等用户操作问题
 */
export class ValidationError extends MarchenError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * 状态前置条件错误
 *
 * 工作区未初始化等系统状态不满足的场景，可附带操作建议
 */
export class StateError extends MarchenError {
  constructor(
    message: string,
    public readonly hint?: string,
  ) {
    super(message)
    this.name = 'StateError'
  }
}

/**
 * 文件系统操作错误
 *
 * 文件/目录不存在、YAML 解析失败等 IO 异常
 */
export class FileSystemError extends MarchenError {
  constructor(
    message: string,
    public readonly path: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = 'FileSystemError'
  }
}
