import { randomUUID } from 'node:crypto'
import { promises as nodeFs } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { FileSystemError } from '@marchen/shared'
import { ensureDir } from './directory.js'

// ============================================================
// 文件读写
// ============================================================

/**
 * 读取文件内容（UTF-8）
 */
export async function readFile(path: string): Promise<string> {
  try {
    return await nodeFs.readFile(path, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new FileSystemError('文件不存在', path)
    }
    throw error
  }
}

/**
 * 写入文件内容（UTF-8），自动创建父目录
 */
export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path))
  await nodeFs.writeFile(path, content, 'utf-8')
}

/**
 * 排他创建 UTF-8 文件，目标已存在时拒绝覆盖
 *
 * @param path - 目标文件路径
 * @param content - UTF-8 文本内容
 */
export async function writeFileExclusive(
  path: string,
  content: string,
): Promise<void> {
  await ensureDir(dirname(path))
  try {
    await nodeFs.writeFile(path, content, { encoding: 'utf-8', flag: 'wx' })
  } catch (error) {
    const cause = error instanceof Error ? error : undefined
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new FileSystemError('文件已存在', path, cause)
    }
    throw new FileSystemError('文件创建失败', path, cause)
  }
}

/**
 * 通过同目录临时文件原子替换 UTF-8 文件
 *
 * @param path - 目标文件路径
 * @param content - UTF-8 文本内容
 */
export async function replaceFileAtomic(
  path: string,
  content: string,
): Promise<void> {
  const parent = dirname(path)
  const temporaryPath = join(parent, `.${basename(path)}.${randomUUID()}.tmp`)
  await ensureDir(parent)
  try {
    await nodeFs.writeFile(temporaryPath, content, {
      encoding: 'utf-8',
      flag: 'wx',
    })
    await nodeFs.rename(temporaryPath, path)
  } catch (error) {
    await nodeFs.rm(temporaryPath, { force: true }).catch(() => undefined)
    throw new FileSystemError(
      '文件替换失败',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 移动单个文件且不覆盖已有目标
 *
 * @param src - 源文件路径
 * @param dest - 目标文件路径
 */
export async function moveFile(src: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest))
  try {
    await nodeFs.access(dest)
    throw new FileSystemError('目标文件已存在', dest)
  } catch (error) {
    if (
      error instanceof FileSystemError ||
      (error as NodeJS.ErrnoException).code !== 'ENOENT'
    ) {
      throw error
    }
  }

  try {
    await nodeFs.rename(src, dest)
  } catch (error) {
    const cause = error instanceof Error ? error : undefined
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new FileSystemError('源文件不存在', src, cause)
    }
    throw new FileSystemError('文件移动失败', src, cause)
  }
}

/**
 * 写入二进制文件，自动创建父目录
 */
export async function writeBinary(
  path: string,
  content: Uint8Array,
): Promise<void> {
  await ensureDir(dirname(path))
  await nodeFs.writeFile(path, content)
}

/**
 * 追加内容到文件末尾（UTF-8），自动创建父目录
 */
export async function appendFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path))
  await nodeFs.appendFile(path, content, 'utf-8')
}

/**
 * 删除文件，不存在时静默跳过
 */
export async function removeFile(path: string): Promise<void> {
  try {
    await nodeFs.unlink(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}
