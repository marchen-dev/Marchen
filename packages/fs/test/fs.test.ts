import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  appendFile,
  ensureDir,
  exists,
  listDir,
  moveFile,
  parseYaml,
  readFile,
  readYaml,
  replaceFileAtomic,
  stringifyYaml,
  writeBinary,
  writeFile,
  writeFileExclusive,
  writeYaml,
} from '../src/index.js'

describe('fs 文件系统操作', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'marchen-test-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('ensureDir 创建目录', () => {
    it('应该递归创建嵌套目录', async () => {
      const dir = join(testDir, 'foo', 'bar', 'baz')
      await ensureDir(dir)
      expect(await exists(dir)).toBe(true)
    })

    it('目录已存在时不应该抛出错误', async () => {
      const dir = join(testDir, 'existing')
      await ensureDir(dir)
      await expect(ensureDir(dir)).resolves.toBeUndefined()
    })
  })

  describe('exists 检查路径存在', () => {
    it('路径存在时应该返回 true', async () => {
      const file = join(testDir, 'test.txt')
      await writeFile(file, 'hello')
      expect(await exists(file)).toBe(true)
    })

    it('路径不存在时应该返回 false', async () => {
      expect(await exists(join(testDir, 'nope.txt'))).toBe(false)
    })
  })

  describe('readFile / writeFile 文件读写', () => {
    it('应该正确写入并读取文件内容', async () => {
      const file = join(testDir, 'hello.txt')
      await writeFile(file, '你好世界')
      expect(await readFile(file)).toBe('你好世界')
    })

    it('写入时应该自动创建父目录', async () => {
      const file = join(testDir, 'a', 'b', 'c.txt')
      await writeFile(file, 'deep')
      expect(await readFile(file)).toBe('deep')
    })

    it('读取不存在的文件时应该抛出 MarchenError', async () => {
      await expect(readFile(join(testDir, 'missing.txt'))).rejects.toThrow(
        '文件不存在',
      )
    })

    it('应该写入二进制文件', async () => {
      const file = join(testDir, 'blob.bin')
      await writeBinary(file, Uint8Array.from([1, 2, 3]))
      const { readFile: readBytes } = await import('node:fs/promises')
      expect([...new Uint8Array(await readBytes(file))]).toEqual([1, 2, 3])
    })

    it('排他创建不应该覆盖已有文件', async () => {
      const file = join(testDir, 'exclusive.txt')
      await writeFileExclusive(file, 'first')
      await expect(writeFileExclusive(file, 'second')).rejects.toThrow(
        '文件已存在',
      )
      expect(await readFile(file)).toBe('first')
    })

    it('应该通过临时文件替换已有文件并清理临时文件', async () => {
      const file = join(testDir, 'atomic.txt')
      await writeFile(file, 'before')
      await replaceFileAtomic(file, 'after')
      expect(await readFile(file)).toBe('after')
      expect(
        (await listDir(testDir)).filter((name) => name.endsWith('.tmp')),
      ).toEqual([])
    })

    it('应该移动文件且拒绝覆盖目标', async () => {
      const source = join(testDir, 'source.txt')
      const destination = join(testDir, 'nested', 'destination.txt')
      await writeFile(source, 'source')
      await moveFile(source, destination)
      expect(await exists(source)).toBe(false)
      expect(await readFile(destination)).toBe('source')

      const nextSource = join(testDir, 'next.txt')
      await writeFile(nextSource, 'next')
      await expect(moveFile(nextSource, destination)).rejects.toThrow(
        '目标文件已存在',
      )
      expect(await readFile(nextSource)).toBe('next')
      expect(await readFile(destination)).toBe('source')
    })
  })

  describe('listDir 列举目录', () => {
    it('应该列举目录下的所有条目', async () => {
      await writeFile(join(testDir, 'a.txt'), '')
      await writeFile(join(testDir, 'b.txt'), '')
      await ensureDir(join(testDir, 'subdir'))
      const entries = await listDir(testDir)
      expect(entries).toContain('a.txt')
      expect(entries).toContain('b.txt')
      expect(entries).toContain('subdir')
    })

    it('空目录时应该返回空数组', async () => {
      const emptyDir = join(testDir, 'empty')
      await ensureDir(emptyDir)
      expect(await listDir(emptyDir)).toEqual([])
    })

    it('目录不存在时应该抛出 MarchenError', async () => {
      await expect(listDir(join(testDir, 'nope'))).rejects.toThrow('目录不存在')
    })
  })

  describe('appendFile 追加文件', () => {
    it('应该追加内容到已有文件', async () => {
      const file = join(testDir, 'log.txt')
      await writeFile(file, '第一行\n')
      await appendFile(file, '第二行\n')
      expect(await readFile(file)).toBe('第一行\n第二行\n')
    })

    it('文件不存在时应该创建并写入', async () => {
      const file = join(testDir, 'new.txt')
      await appendFile(file, '内容')
      expect(await readFile(file)).toBe('内容')
    })

    it('应该自动创建父目录', async () => {
      const file = join(testDir, 'deep', 'dir', 'file.txt')
      await appendFile(file, '深层')
      expect(await readFile(file)).toBe('深层')
    })
  })

  describe('readYaml / writeYaml YAML 读写', () => {
    it('应该正确写入并读取 YAML 文件', async () => {
      const file = join(testDir, 'config.yaml')
      const data = { schema: 'full', providers: ['claude-code'] }
      await writeYaml(file, data)
      const result = await readYaml<typeof data>(file)
      expect(result).toEqual(data)
    })

    it('无效 YAML 时应该抛出 MarchenError', async () => {
      const file = join(testDir, 'bad.yaml')
      await writeFile(file, '{{invalid: yaml::}')
      await expect(readYaml(file)).rejects.toThrow('YAML 解析失败')
    })

    it('应该解析并序列化 YAML 字符串', () => {
      const data = { title: '想法', tags: ['cli', 'skill'] }
      expect(parseYaml<typeof data>(stringifyYaml(data))).toEqual(data)
    })

    it('解析无效 YAML 字符串时应该包含来源', () => {
      expect(() => parseYaml('{{invalid', 'idea.md')).toThrowError(
        expect.objectContaining({ message: 'YAML 解析失败', path: 'idea.md' }),
      )
    })
  })
})
