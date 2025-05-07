export type PromptType = 'summary' | 'category' | 'tags' | 'slug' | 'title'

export const promptTools = (params: { type: PromptType; args: string[] }) => {
  const { type, args } = params
  switch (type) {
    case 'summary': {
      return `请将以下内容生成不超过150字的纯文本摘要：${args[0]}`
    }
    case 'category': {
      return `为文章 "${args[0]}" 选择最合适的分类ID。分类列表：${JSON.stringify(args[1])}`
    }
    case 'tags': {
      return `为文章 "${args[0]}" 生成不超过3个的标签： `
    }
    case 'slug': {
      return `为文章 "${args[0]}" 生成一个简洁的英文slug：`
    }
    case 'title': {
      return `为文章 "${args[0]}" 生成一个简洁的标题：`
    }
    default: {
      throw new Error(`Invalid prompt type: ${type}`)
    }
  }
}
