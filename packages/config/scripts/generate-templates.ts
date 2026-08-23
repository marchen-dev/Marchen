/**
 * 模板 codegen 脚本
 *
 * 读取 templates/ 下的 .md 文件，生成 src/generated/ 下的 TypeScript 常量文件。
 * 解决 cli bundle（alwaysBundle）无法打包静态 .md 文件的问题。
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const templatesDir = join(root, 'templates')
const generatedDir = join(root, 'src', 'generated')

/** 转义模板字符串中的特殊字符 */
function escapeTemplateString(content: string): string {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
}

/** 文件名转 UPPER_SNAKE_CASE（propose.md → PROPOSE） */
function toConstName(fileName: string): string {
  return basename(fileName, '.md').toUpperCase().replace(/-/g, '_')
}

/** 文件名转 camelCase（propose.md → propose） */
function toKey(fileName: string): string {
  return basename(fileName, '.md')
}

/** 对象 key 不是合法 JS 标识符时需要加引号 */
function quoteIfNeeded(key: string): string {
  return /^[a-z_$][\w$]*$/i.test(key) ? key : `'${key}'`
}

/** 文件名转 skill 目录名（propose.md → marchen-propose） */
function toSkillDirName(fileName: string): string {
  return `marchen-${basename(fileName, '.md')}`
}

/** 按 Prettier 的默认行宽生成对象项，避免 codegen 后工作区变脏 */
function pushObjectEntry(
  lines: string[],
  key: string,
  properties: string[],
): void {
  const singleLine = `  ${key}: { ${properties.join(', ')} },`
  if (singleLine.length <= 80) {
    lines.push(singleLine)
    return
  }

  lines.push(`  ${key}: {`)
  for (const property of properties) {
    lines.push(`    ${property},`)
  }
  lines.push('  },')
}

/** 读取目录下所有 .md 文件 */
function readMdFiles(
  dir: string,
): Array<{ fileName: string; content: string }> {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((fileName) => ({
        fileName,
        content: readFileSync(join(dir, fileName), 'utf-8'),
      }))
  } catch {
    return []
  }
}

// 确保输出目录存在
mkdirSync(generatedDir, { recursive: true })

// 生成 skill-templates.ts
const skills = readMdFiles(join(templatesDir, 'skills'))
const skillLines = [
  '// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改',
  '',
]

for (const { fileName, content } of skills) {
  const constName = `SKILL_${toConstName(fileName)}`
  skillLines.push(
    `export const ${constName} = \`${escapeTemplateString(content)}\``,
  )
  skillLines.push('')
}

skillLines.push('/** Skill 模板定义 */')
skillLines.push('export interface SkillTemplate {')
skillLines.push('  readonly dirName: string')
skillLines.push('  readonly content: string')
skillLines.push('}')
skillLines.push('')
skillLines.push('/** 所有 skill 模板 */')
skillLines.push(
  'export const SKILL_TEMPLATES: Record<string, SkillTemplate> = {',
)
for (const { fileName } of skills) {
  const key = quoteIfNeeded(toKey(fileName))
  const constName = `SKILL_${toConstName(fileName)}`
  const dirName = toSkillDirName(fileName)
  pushObjectEntry(skillLines, key, [
    `dirName: '${dirName}'`,
    `content: ${constName}`,
  ])
}
skillLines.push('}')
skillLines.push('')

writeFileSync(join(generatedDir, 'skill-templates.ts'), skillLines.join('\n'))

// 生成 command-templates.ts
const commands = readMdFiles(join(templatesDir, 'commands'))
const cmdLines = [
  '// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改',
  '',
]

for (const { fileName, content } of commands) {
  const constName = `COMMAND_${toConstName(fileName)}`
  cmdLines.push(
    `export const ${constName} = \`${escapeTemplateString(content)}\``,
  )
  cmdLines.push('')
}

cmdLines.push('/** Command 模板定义 */')
cmdLines.push('export interface CommandTemplate {')
cmdLines.push('  readonly fileName: string')
cmdLines.push('  readonly content: string')
cmdLines.push('}')
cmdLines.push('')
cmdLines.push('/** 所有 command 模板 */')
cmdLines.push(
  'export const COMMAND_TEMPLATES: Record<string, CommandTemplate> = {',
)
for (const { fileName } of commands) {
  const key = quoteIfNeeded(toKey(fileName))
  const constName = `COMMAND_${toConstName(fileName)}`
  pushObjectEntry(cmdLines, key, [
    `fileName: '${fileName}'`,
    `content: ${constName}`,
  ])
}
cmdLines.push('}')
cmdLines.push('')

writeFileSync(join(generatedDir, 'command-templates.ts'), cmdLines.join('\n'))

const pagePath = join(root, '..', 'acceptance-ui', 'dist', 'index.html')
if (!existsSync(pagePath)) {
  throw new Error(
    '缺少 @marchen/acceptance-ui 的 dist/index.html，请先运行 pnpm --filter @marchen/acceptance-ui build',
  )
}
const pageContent = readFileSync(pagePath, 'utf-8')
if (!pageContent.includes('id="acceptance-data"')) {
  throw new Error(
    '验收页构建产物缺少 <script id="acceptance-data">，无法灌数据',
  )
}
writeFileSync(
  join(generatedDir, 'acceptance-page.ts'),
  [
    '// 此文件由 scripts/generate-templates.ts 自动生成，请勿手动修改',
    '',
    `export const ACCEPTANCE_PAGE_TEMPLATE = \`${escapeTemplateString(pageContent)}\``,
    '',
  ].join('\n'),
)

console.log(
  `Generated ${skills.length} skill template(s), ${commands.length} command template(s), acceptance page`,
)
