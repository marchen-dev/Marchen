import { Buffer } from 'node:buffer'
import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { readStdin } from '../src/utils/stdin.js'

describe('readStdin', () => {
  it('拼接所有输入块并按 UTF-8 返回', async () => {
    const stream = Readable.from([Buffer.from('你好'), '，Marchen'])
    await expect(readStdin(stream)).resolves.toBe('你好，Marchen')
  })

  it('拒绝空白输入', async () => {
    await expect(readStdin(Readable.from(['  \n']))).rejects.toThrow(
      '标准输入不能为空',
    )
  })
})
