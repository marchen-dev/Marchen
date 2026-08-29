export const INSPECTOR_BREAKPOINT = 1280

/** 判断当前视口是否应显示常驻检查器。 */
export function usesInlineInspector(viewportWidth: number): boolean {
  return viewportWidth >= INSPECTOR_BREAKPOINT
}

/** 在案例或证据数量变化时，把图片索引约束到有效范围。 */
export function normalizeImageIndex(index: number, imageCount: number): number {
  if (imageCount <= 0) return 0
  return Math.min(Math.max(0, index), imageCount - 1)
}

/** 生成跨断点保存人工草稿的稳定键。 */
export function opinionDraftKey(roundIndex: number, caseId: string): string {
  return `${roundIndex}:${caseId}`
}

/** 页头只汇总整单信息，不推导逐项已查看进度。 */
export function acceptanceSummary(caseCount: number, pendingCount: number) {
  return { caseCount, pendingCount }
}
