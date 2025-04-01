import { isServerSide } from './env'

export const mergeUrlParams = (p: Record<string, string>) => {
  if (isServerSide) {
    return p
  }
  // 获取当前 URL 的参数
  const currentParams = new URLSearchParams(window.location.search)
  const mergedParams = new URLSearchParams()

  // 先添加当前 URL 的参数
  currentParams.forEach((value, key) => {
    mergedParams.set(key, value)
  })

  // 再添加传入的参数，如果有重复的 key，会覆盖当前 URL 的值
  Object.entries(p ?? {}).forEach(([key, value]) => {
    mergedParams.set(key, value)
  })

  // 返回合并后的参数对象
  return Object.fromEntries(mergedParams.entries())
}
