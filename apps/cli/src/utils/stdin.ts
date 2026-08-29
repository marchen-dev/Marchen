import type { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'
import { ValidationError } from '@marchen/shared'

/**
 * 读取完整 UTF-8 标准输入
 *
 * @param stream - 可读取流，默认使用当前进程 stdin
 */
export async function readStdin(
  stream: NodeJS.ReadableStream = process.stdin,
): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stream as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
  }
  const content = Buffer.concat(chunks).toString('utf-8')
  if (!content.trim()) {
    throw new ValidationError('标准输入不能为空')
  }
  return content
}
