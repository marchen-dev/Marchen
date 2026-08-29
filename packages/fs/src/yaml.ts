import { FileSystemError } from '@marchen/shared'
import yaml from 'js-yaml'
import { readFile, writeFile } from './file.js'

// ============================================================
// YAML 读写
// ============================================================

/**
 * 读取 YAML 文件并解析为对象
 */
export async function readYaml<T>(path: string): Promise<T> {
  const content = await readFile(path)
  return parseYaml<T>(content, path)
}

/**
 * 解析 YAML 字符串
 *
 * @param content - YAML 文本
 * @param source - 错误信息中展示的来源
 */
export function parseYaml<T>(content: string, source = '<yaml>'): T {
  try {
    return yaml.load(content) as T
  } catch (error) {
    throw new FileSystemError(
      'YAML 解析失败',
      source,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * 将对象序列化为 YAML 字符串
 *
 * @param data - 可被 js-yaml 序列化的数据
 */
export function stringifyYaml(data: unknown): string {
  return yaml.dump(data, { indent: 2 })
}

/**
 * 将对象序列化为 YAML 并写入文件（2 空格缩进）
 */
export async function writeYaml(path: string, data: unknown): Promise<void> {
  const content = stringifyYaml(data)
  await writeFile(path, content)
}
