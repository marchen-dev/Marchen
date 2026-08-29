import type {
  CaseItem,
  Decision,
  DecisionItem,
  NewImage,
  Round,
} from '@/lib/payload'
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  ImageIcon,
  ImagePlusIcon,
  MessageSquareIcon,
  SendIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useWideInspector } from '@/hooks/use-wide-inspector'
import {
  caseHistory,
  caseStatusLabel,
  decisionToken,
  fetchDecision,
  fileToNewImage,
  imageEvidence,
  isAllowedImageFile,
  isReviewWritable,
  postDecision,
  probeLive,
  readEmbeddedPayload,
} from '@/lib/payload'
import { normalizeImageIndex, opinionDraftKey } from '@/lib/review-workbench'
import { cn } from '@/lib/utils'

type ConfirmMode = 'accept' | 'reject' | null

interface OpinionDraft {
  comment: string
  keptImages: string[]
  files: File[]
  tab: string
}

/** 验收页主界面：在同一条案例证据链中完成查看、追溯和签核。 */
export function ReviewApp() {
  const embedded = useMemo(() => readEmbeddedPayload(), [])
  const token = useMemo(() => decisionToken(), [])
  const [live, setLive] = useState(false)
  const [decision, setDecision] = useState<Decision>(embedded.decision)
  const [hint, setHint] = useState('')
  const [busy, setBusy] = useState(false)
  const [roundPosition, setRoundPosition] = useState(
    Math.max(0, embedded.rounds.length - 1),
  )
  const [caseIndex, setCaseIndex] = useState(0)
  const [changesOpen, setChangesOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null)
  const [drafts, setDrafts] = useState<Record<string, OpinionDraft>>({})
  const wideInspector = useWideInspector()

  const rounds = embedded.rounds
  const latestPosition = Math.max(0, rounds.length - 1)
  const selectedRound = rounds[roundPosition]
  const cases = selectedRound?.cases ?? []
  const current = cases[caseIndex] ?? cases[0]
  const viewingLatest = roundPosition === latestPosition
  const writable = isReviewWritable(live, decision.status, viewingLatest)
  const pending = decision.items
  const draftKey = current
    ? opinionDraftKey(selectedRound?.index ?? 0, current.id)
    : ''
  const initialOpinion = current
    ? pending.find((item) => item.id === current.id)
    : undefined
  const draft = drafts[draftKey] ?? createOpinionDraft(initialOpinion)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const ok = await probeLive()
      if (cancelled || !ok) return
      try {
        const next = await fetchDecision(token)
        if (!cancelled) {
          setDecision(next)
          setLive(true)
        }
      } catch {
        if (!cancelled) setLive(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    setCaseIndex((value) => Math.min(value, Math.max(0, cases.length - 1)))
  }, [cases.length])

  const persist = useCallback(
    async (
      status: Decision['status'],
      items: Array<DecisionItem & { newImages?: NewImage[] }>,
    ): Promise<boolean> => {
      setBusy(true)
      setHint('')
      try {
        const next = await postDecision(token, status, items)
        setDecision(next)
        return true
      } catch (error) {
        setHint(error instanceof Error ? error.message : '写入失败')
        return false
      } finally {
        setBusy(false)
      }
    },
    [token],
  )

  const saveOpinion = async (
    comment: string,
    keptImages: string[],
    files: File[],
  ): Promise<boolean> => {
    if (!current || comment.trim() === '') return false
    const newImages: NewImage[] = []
    for (const file of files) newImages.push(await fileToNewImage(file))
    return await persist('pending', [
      ...pending.filter((item) => item.id !== current.id),
      {
        id: current.id,
        comment: comment.trim(),
        images: keptImages,
        newImages,
      },
    ])
  }

  const withdrawOpinion = async (id: string): Promise<void> => {
    await persist(
      'pending',
      pending.filter((item) => item.id !== id),
    )
  }

  const updateDraft = (nextDraft: OpinionDraft) => {
    if (!draftKey) return
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: nextDraft,
    }))
  }

  const selectCase = (index: number) => {
    setCaseIndex(index)
  }

  const jumpToPending = (id: string) => {
    setRoundPosition(latestPosition)
    const nextIndex = rounds[latestPosition]?.cases.findIndex(
      (item) => item.id === id,
    )
    setCaseIndex(nextIndex != null && nextIndex >= 0 ? nextIndex : 0)
    setChangesOpen(false)
    if (!wideInspector) setInspectorOpen(true)
  }

  const confirmDecision = async () => {
    const mode = confirmMode
    setConfirmMode(null)
    if (mode === 'accept') {
      await persist('accepted', [])
    } else if (mode === 'reject') {
      const ok = await persist('rejected', pending)
      if (ok) setChangesOpen(false)
    }
  }

  return (
    <SidebarProvider className="h-full min-h-0 overflow-hidden text-foreground">
      <CaseSidebar
        cases={cases}
        selectedIndex={caseIndex}
        pending={pending}
        onSelect={selectCase}
      />
      <SidebarInset className="h-svh min-h-0 overflow-hidden">
        <AcceptanceHeader
          requirement={embedded.requirement}
          round={selectedRound}
          roundPosition={roundPosition}
          roundCount={rounds.length}
          caseCount={cases.length}
          decision={decision}
          live={live}
          pendingCount={pending.length}
          writable={writable}
          showInspectorAction={!wideInspector && Boolean(current)}
          onBeforeToggleSidebar={() => {
            setInspectorOpen(false)
            setChangesOpen(false)
          }}
          onOpenInspector={() => {
            setChangesOpen(false)
            setInspectorOpen(true)
          }}
          onPreviousRound={() => {
            setRoundPosition((value) => Math.max(0, value - 1))
            setCaseIndex(0)
          }}
          onNextRound={() => {
            setRoundPosition((value) => Math.min(latestPosition, value + 1))
            setCaseIndex(0)
          }}
          onPrimaryAction={() => {
            setInspectorOpen(false)
            if (pending.length === 0) setConfirmMode('accept')
            else setChangesOpen(true)
          }}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_var(--review-inspector-width)]">
          {current && selectedRound ? (
            <ScrollArea className="min-h-0 min-w-0 bg-background">
              <article className="flex min-h-full min-w-0 flex-col gap-4 p-4 sm:p-6">
                <EvidenceToolbar
                  item={current}
                  index={caseIndex}
                  total={cases.length}
                  pending={pending.some((item) => item.id === current.id)}
                  onPrevious={() => setCaseIndex((value) => Math.max(0, value - 1))}
                  onNext={() =>
                    setCaseIndex((value) => Math.min(cases.length - 1, value + 1))
                  }
                />
                <EvidenceViewer item={current} roundIndex={selectedRound.index} />
              </article>
            </ScrollArea>
          ) : (
            <Empty className="h-full rounded-none border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>还没有验收证据</EmptyTitle>
                <EmptyDescription>
                  等一轮取证写入后，这里会出现案例目录和证据记录。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {wideInspector && current && selectedRound ? (
            <ReviewInspector
              item={current}
              round={selectedRound}
              rounds={rounds}
              pending={initialOpinion}
              draft={draft}
              writable={writable}
              busy={busy}
              readOnlyReason={readOnlyReason(viewingLatest, decision.status)}
              onDraftChange={updateDraft}
              onSave={saveOpinion}
              onWithdraw={withdrawOpinion}
            />
          ) : null}
        </div>
      </SidebarInset>

      <SurfaceCoordinator
        inspectorOpen={inspectorOpen}
        changesOpen={changesOpen}
      />

      {!wideInspector && current && selectedRound ? (
        <Sheet
          open={inspectorOpen}
          onOpenChange={(open) => {
            setInspectorOpen(open)
            if (open) setChangesOpen(false)
          }}
        >
          <SheetContent side="right" className="w-[min(31rem,calc(100%-1rem))] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>当前项检查器</SheetTitle>
              <SheetDescription>查看结论、历史并填写人工意见。</SheetDescription>
            </SheetHeader>
            <ReviewInspector
              item={current}
              round={selectedRound}
              rounds={rounds}
              pending={initialOpinion}
              draft={draft}
              writable={writable}
              busy={busy}
              readOnlyReason={readOnlyReason(viewingLatest, decision.status)}
              onDraftChange={updateDraft}
              onSave={saveOpinion}
              onWithdraw={withdrawOpinion}
            />
          </SheetContent>
        </Sheet>
      ) : null}

      <ChangesSheet
        open={changesOpen}
        onOpenChange={(open) => {
          setChangesOpen(open)
          if (open) setInspectorOpen(false)
        }}
        pending={pending}
        cases={rounds[latestPosition]?.cases ?? []}
        writable={writable}
        busy={busy}
        onJump={jumpToPending}
        onWithdraw={withdrawOpinion}
        onSubmit={() => setConfirmMode('reject')}
      />
      <DecisionConfirmation
        mode={confirmMode}
        count={pending.length}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setConfirmMode(null)
        }}
        onConfirm={() => void confirmDecision()}
      />
      <p className="sr-only" role="status">
        {hint}
      </p>
    </SidebarProvider>
  )
}

function AcceptanceHeader({
  requirement,
  round,
  roundPosition,
  roundCount,
  caseCount,
  decision,
  live,
  pendingCount,
  writable,
  showInspectorAction,
  onBeforeToggleSidebar,
  onOpenInspector,
  onPreviousRound,
  onNextRound,
  onPrimaryAction,
}: {
  requirement: string
  round: Round | undefined
  roundPosition: number
  roundCount: number
  caseCount: number
  decision: Decision
  live: boolean
  pendingCount: number
  writable: boolean
  showInspectorAction: boolean
  onBeforeToggleSidebar: () => void
  onOpenInspector: () => void
  onPreviousRound: () => void
  onNextRound: () => void
  onPrimaryAction: () => void
}) {
  return (
    <header className="flex min-h-16 shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-5">
      <SidebarTrigger
        aria-label="切换案例导航"
        onClick={onBeforeToggleSidebar}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-tight">交付验收</p>
          <StatusBadge status={decision.status} live={live} />
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <p className="truncate">{requirement || round?.title || '未写验收目标'}</p>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{caseCount} 项</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{pendingCount} 项待修改</span>
        </div>
      </div>
      {roundCount > 0 ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="上一轮"
            disabled={roundPosition === 0}
            onClick={onPreviousRound}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
            第 {round?.index ?? 0} 轮
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="下一轮"
            disabled={roundPosition >= roundCount - 1}
            onClick={onNextRound}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      ) : null}
      {showInspectorAction ? (
        <Button variant="outline" onClick={onOpenInspector}>
          <MessageSquareIcon data-icon="inline-start" />
          <span className="max-[560px]:sr-only">检查当前项</span>
        </Button>
      ) : null}
      <div id="write-zone" hidden={!writable}>
        {writable ? (
          <Button
            variant={pendingCount === 0 ? 'default' : 'outline'}
            onClick={onPrimaryAction}
          >
            {pendingCount === 0 ? (
              <CheckCircle2Icon data-icon="inline-start" />
            ) : (
              <MessageSquareIcon data-icon="inline-start" />
            )}
            {pendingCount === 0 ? '接受交付' : `修改清单 ${pendingCount}`}
          </Button>
        ) : null}
      </div>
    </header>
  )
}

function CaseSidebar({
  cases,
  selectedIndex,
  pending,
  className,
  onSelect,
}: {
  cases: CaseItem[]
  selectedIndex: number
  pending: readonly DecisionItem[]
  className?: string
  onSelect: (index: number) => void
}) {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" className={className}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium">验收项</p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {cases.length} 项
          </span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <ScrollArea className="min-h-0 flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>当前轮次</SidebarGroupLabel>
            <SidebarMenu>
              {cases.map((item, index) => {
                const flagged = pending.some((entry) => entry.id === item.id)
                return (
                  <SidebarMenuItem key={`${item.id}-${index}`}>
                    <SidebarMenuButton
                      isActive={index === selectedIndex}
                      aria-current={index === selectedIndex ? 'page' : undefined}
                      onClick={() => {
                        onSelect(index)
                        setOpenMobile(false)
                      }}
                    >
                      <CaseStatusIcon status={item.status} flagged={flagged} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {item.name || item.id}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {flagged ? '待修改' : caseStatusLabel(item.status)}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}

function EvidenceToolbar({
  item,
  index,
  total,
  pending,
  onPrevious,
  onNext,
}: {
  item: CaseItem
  index: number
  total: number
  pending: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{item.name || item.id}</p>
          <CaseStatusBadge status={item.status} flagged={pending} />
        </div>
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {index + 1} / {total}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="上一项"
          disabled={index === 0}
          onClick={onPrevious}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="下一项"
          disabled={index >= total - 1}
          onClick={onNext}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

/** 当前案例的模型结论、历史和人工意见检查器。 */
function ReviewInspector({
  item,
  round,
  rounds,
  pending,
  draft,
  writable,
  busy,
  readOnlyReason,
  onDraftChange,
  onSave,
  onWithdraw,
}: {
  item: CaseItem
  round: Round
  rounds: Round[]
  pending: DecisionItem | undefined
  draft: OpinionDraft
  writable: boolean
  busy: boolean
  readOnlyReason: string
  onDraftChange: (draft: OpinionDraft) => void
  onSave: (comment: string, keptImages: string[], files: File[]) => Promise<boolean>
  onWithdraw: (id: string) => Promise<void>
}) {
  return (
    <aside className="min-h-0 min-w-0 border-l bg-background" aria-label="当前项检查器">
      <ScrollArea className="h-full min-h-0">
        <div className="flex flex-col gap-6 p-5">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">
                {item.name || item.id}
              </h1>
              <CaseStatusBadge status={item.status} flagged={Boolean(pending)} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">第 {round.index} 轮</p>
          </header>
          <Separator />
          <section aria-labelledby="ai-observation-title" className="flex flex-col gap-2">
            <h2 id="ai-observation-title" className="text-sm font-semibold">
              AI 检查结论
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {item.observation || round.conclusion || '这一轮没有留下补充说明。'}
            </p>
          </section>
          <HistoryTimeline
            rounds={rounds}
            caseId={item.id}
            selectedRoundIndex={round.index}
          />
          <OpinionComposer
            item={item}
            initial={pending}
            draft={draft}
            writable={writable}
            busy={busy}
            readOnlyReason={readOnlyReason}
            onDraftChange={onDraftChange}
            onSave={onSave}
            onWithdraw={onWithdraw}
          />
        </div>
      </ScrollArea>
    </aside>
  )
}

/** 任一右侧 Sheet 打开时关闭移动端案例导航，避免多个浮层叠加。 */
function SurfaceCoordinator({
  inspectorOpen,
  changesOpen,
}: {
  inspectorOpen: boolean
  changesOpen: boolean
}) {
  const { setOpenMobile } = useSidebar()
  useEffect(() => {
    if (inspectorOpen || changesOpen) setOpenMobile(false)
  }, [changesOpen, inspectorOpen, setOpenMobile])
  return null
}

function EvidenceViewer({
  item,
  roundIndex,
}: {
  item: CaseItem
  roundIndex: number
}) {
  const images = imageEvidence(item)
  const [active, setActive] = useState(0)
  const safeActive = normalizeImageIndex(active, images.length)
  const current = images[safeActive]

  useEffect(() => {
    setActive(0)
  }, [item.id, roundIndex])

  if (!current) return <EvidenceEmpty observation={item.observation} />

  return (
    <Dialog>
      <section
        aria-labelledby="evidence-title"
        className="flex min-h-[calc(100svh-9rem)] min-w-0 flex-1 flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="evidence-title" className="text-sm font-semibold">
            截图证据
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {safeActive + 1} / {images.length}
          </span>
        </div>
        <DialogTrigger
          render={
            <button
              type="button"
              aria-label={`全屏查看${item.name || item.id}的第 ${safeActive + 1} 张截图`}
              className="flex min-h-80 flex-1 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-[var(--evidence-canvas)] p-4 outline-none ring-1 ring-border focus-visible:ring-3 focus-visible:ring-ring/60"
            />
          }
        >
          <img
            src={current.path}
            alt={`${item.name || item.id} 截图 ${safeActive + 1}`}
            className="max-h-[calc(100svh-14rem)] max-w-full object-contain"
          />
        </DialogTrigger>
        <EvidenceThumbnails images={images} active={safeActive} onSelect={setActive} />
      </section>

      <DialogContent
        className="top-0 left-0 grid size-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 rounded-none bg-[var(--evidence-canvas)] p-0 text-white ring-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="border-b border-white/15 bg-black/30 px-5 py-4 pr-14">
          <DialogTitle className="truncate text-white">
            {item.name || item.id}
          </DialogTitle>
          <p className="text-xs text-white/65">
            截图 {safeActive + 1} / {images.length}
          </p>
        </DialogHeader>
        <ScrollArea className="min-h-0">
          <div className="flex min-h-full justify-center p-4 sm:p-8">
            <img
              src={current.path}
              alt={`${item.name || item.id} 截图 ${safeActive + 1}`}
              className="h-auto max-w-full self-start object-contain"
            />
          </div>
        </ScrollArea>
        <div className="border-t border-white/15 bg-black/30 p-3">
          <EvidenceThumbnails
            images={images}
            active={safeActive}
            inverse
            onSelect={setActive}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** 主画布与全屏 Dialog 共用的图片切换条。 */
function EvidenceThumbnails({
  images,
  active,
  inverse = false,
  onSelect,
}: {
  images: ReturnType<typeof imageEvidence>
  active: number
  inverse?: boolean
  onSelect: (index: number) => void
}) {
  if (images.length <= 1) return null
  return (
    <div className="flex gap-2 overflow-x-auto p-1" aria-label="截图列表">
      {images.map((image, index) => (
        <button
          key={`${image.path}-${index}`}
          type="button"
          aria-pressed={index === active}
          aria-label={`查看第 ${index + 1} 张截图`}
          className={cn(
            'size-16 shrink-0 overflow-hidden rounded-lg bg-muted outline-none ring-1 ring-border transition-[opacity,box-shadow] hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/60 aria-pressed:ring-2 aria-pressed:ring-foreground',
            inverse && 'ring-white/25 aria-pressed:ring-white',
          )}
          onClick={() => onSelect(index)}
        >
          <img src={image.path} alt="" className="size-full object-cover" />
        </button>
      ))}
    </div>
  )
}

function EvidenceEmpty({ observation }: { observation: string }) {
  return (
    <Empty className="min-h-64 bg-muted/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageIcon />
        </EmptyMedia>
        <EmptyTitle>这一项没有截图</EmptyTitle>
        <EmptyDescription>
          {observation || '查看下方 AI 检查说明了解这一项的结果。'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function HistoryTimeline({
  rounds,
  caseId,
  selectedRoundIndex,
}: {
  rounds: Round[]
  caseId: string
  selectedRoundIndex: number
}) {
  const history = caseHistory(rounds, caseId, selectedRoundIndex)

  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-4">
      <h2 id="history-title" className="text-sm font-semibold">
        验收记录
      </h2>
      {history.length === 0 ? (
        <p className="border-l-2 pl-5 text-sm text-muted-foreground">
          这是该案例的第一条记录。
        </p>
      ) : (
        <div className="ml-1 border-l pl-6">
          {history.map((round) => (
            <RoundRecord key={round.index} round={round} caseId={caseId} />
          ))}
        </div>
      )}
    </section>
  )
}

function RoundRecord({ round, caseId }: { round: Round; caseId: string }) {
  const item = round.cases.find((entry) => entry.id === caseId)
  const human = round.humanDecision?.items.find((entry) => entry.id === caseId)
  const humanSummary = human
    ? human.comment
    : round.humanDecision?.status === 'accepted'
      ? '本轮接受交付'
      : round.humanDecision
        ? '本轮没有对此项提出修改'
        : '没有人工验收记录'

  return (
    <Collapsible className="relative pb-6 last:pb-0">
      <span className="absolute -left-[1.72rem] top-2 size-2 rounded-full bg-foreground ring-4 ring-background" />
      <CollapsibleTrigger className="group flex w-full items-start gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">第 {round.index} 轮</span>
            <span className="text-xs text-muted-foreground">
              {item ? caseStatusLabel(item.status) : '案例已移除'}
            </span>
          </span>
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            {humanSummary}
          </span>
        </span>
        <ChevronDownIcon className="mt-1 transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">AI 检查</p>
            <p className="mt-1 text-sm leading-6">
              {item?.observation || round.conclusion || '没有补充说明'}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              人工决定
            </p>
            <MarkdownPreview text={humanSummary} className="mt-1" />
            {human && human.images.length > 0 ? (
              <AttachmentStrip images={human.images} className="mt-3" />
            ) : null}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function OpinionComposer({
  item,
  initial,
  draft,
  writable,
  busy,
  readOnlyReason,
  onDraftChange,
  onSave,
  onWithdraw,
}: {
  item: CaseItem
  initial: DecisionItem | undefined
  draft: OpinionDraft
  writable: boolean
  busy: boolean
  readOnlyReason: string
  onDraftChange: (draft: OpinionDraft) => void
  onSave: (
    comment: string,
    keptImages: string[],
    files: File[],
  ) => Promise<boolean>
  onWithdraw: (id: string) => Promise<void>
}) {
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useMemo(
    () => draft.files.map((file) => URL.createObjectURL(file)),
    [draft.files],
  )

  useEffect(() => {
    return () => {
      for (const url of previews) URL.revokeObjectURL(url)
    }
  }, [previews])

  const addFiles = (list: FileList | File[]) => {
    const all = [...list]
    const next = all.filter((file) => isAllowedImageFile(file))
    setError(
      next.length === all.length ? '' : '附图只支持 png / jpeg / webp / gif',
    )
    onDraftChange({ ...draft, files: [...draft.files, ...next] })
  }

  if (!writable) {
    return (
      <section aria-labelledby="opinion-title" className="flex flex-col gap-3">
        <h2 id="opinion-title" className="text-sm font-semibold">
          你的意见
        </h2>
        <div className="border-l-2 pl-5">
          {initial ? (
            <>
              <MarkdownPreview text={initial.comment} />
              {initial.images.length > 0 ? (
                <AttachmentStrip images={initial.images} className="mt-3" />
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{readOnlyReason}</p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="opinion-title"
      className="flex flex-col gap-3 pb-8"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="opinion-title" className="text-sm font-semibold">
          你的意见
        </h2>
        {initial ? <Badge variant="outline">已加入修改清单</Badge> : null}
      </div>
      <div
        className={cn(
          'rounded-xl ring-1 ring-border transition-shadow',
          dragging && 'ring-3 ring-ring/40',
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
      >
        <Tabs
          value={draft.tab}
          onValueChange={(value) =>
            onDraftChange({ ...draft, tab: String(value) })
          }
          className="gap-0"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <TabsList>
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>
            <span className="text-xs text-muted-foreground">支持 Markdown</span>
          </div>
          <TabsContent value="edit" className="p-3">
            <FieldGroup>
              <Field data-invalid={Boolean(error) || undefined}>
                <FieldLabel htmlFor={`opinion-${item.id}`} className="sr-only">
                  修改说明
                </FieldLabel>
                <Textarea
                  id={`opinion-${item.id}`}
                  value={draft.comment}
                  aria-invalid={Boolean(error)}
                  className="min-h-36 resize-y border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                  placeholder="说明哪里不符合预期，以及希望改成什么样。"
                  onChange={(event) =>
                    onDraftChange({ ...draft, comment: event.target.value })
                  }
                  onPaste={(event) => {
                    const pasted = [...event.clipboardData.files].filter(
                      (file) => file.type.startsWith('image/'),
                    )
                    if (pasted.length === 0) return
                    event.preventDefault()
                    addFiles(pasted)
                  }}
                />
                <FieldDescription>
                  图片可以粘贴、拖入或从本地选择，将作为附件保存。
                </FieldDescription>
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
            </FieldGroup>
          </TabsContent>
          <TabsContent value="preview" className="min-h-44 p-4">
            {draft.comment.trim() ? (
              <MarkdownPreview text={draft.comment} />
            ) : (
              <p className="text-sm text-muted-foreground">
                还没有可预览的内容。
              </p>
            )}
          </TabsContent>
        </Tabs>

        {draft.keptImages.length + draft.files.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t p-3">
            {draft.keptImages.map((src) => (
              <AttachmentPreview
                key={src}
                src={src}
                onRemove={() =>
                  onDraftChange({
                    ...draft,
                    keptImages: draft.keptImages.filter((image) => image !== src),
                  })
                }
              />
            ))}
            {previews.map((src, index) => (
              <AttachmentPreview
                key={src}
                src={src}
                onRemove={() =>
                  onDraftChange({
                    ...draft,
                    files: draft.files.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files)
              event.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlusIcon data-icon="inline-start" />
            添加图片
          </Button>
          <div className="flex items-center gap-2">
            {initial ? (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void onWithdraw(item.id)}
              >
                <Undo2Icon data-icon="inline-start" />
                撤回
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                if (draft.comment.trim() === '') {
                  setError('请填写修改说明')
                  return
                }
                setError('')
                void onSave(
                  draft.comment,
                  draft.keptImages,
                  draft.files,
                ).then((saved) => {
                  if (saved) onDraftChange({ ...draft, files: [] })
                })
              }}
            >
              <MessageSquareIcon data-icon="inline-start" />
              {initial ? '保存意见' : '加入修改清单'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChangesSheet({
  open,
  onOpenChange,
  pending,
  cases,
  writable,
  busy,
  onJump,
  onWithdraw,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: readonly DecisionItem[]
  cases: CaseItem[]
  writable: boolean
  busy: boolean
  onJump: (id: string) => void
  onWithdraw: (id: string) => Promise<void>
  onSubmit: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>修改清单</SheetTitle>
          <SheetDescription>
            {pending.length === 0
              ? '当前没有修改意见。'
              : `共 ${pending.length} 项，确认后交给 AI 统一修改。`}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          {pending.length === 0 ? (
            <Empty className="h-full rounded-none border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle2Icon />
                </EmptyMedia>
                <EmptyTitle>修改清单为空</EmptyTitle>
                <EmptyDescription>
                  回到案例中填写意见，或直接接受交付。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col p-5">
              {pending.map((item, index) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-5 first:pt-0"
                >
                  <button
                    type="button"
                    className="text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => onJump(item.id)}
                  >
                    <span className="text-sm font-medium">
                      {labelFor(item.id, cases)}
                    </span>
                    <MarkdownPreview text={item.comment} className="mt-2" />
                  </button>
                  {item.images.length > 0 ? (
                    <AttachmentStrip images={item.images} />
                  ) : null}
                  {writable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start"
                      disabled={busy}
                      onClick={() => void onWithdraw(item.id)}
                    >
                      <Undo2Icon data-icon="inline-start" />
                      撤回
                    </Button>
                  ) : null}
                  {index < pending.length - 1 ? <Separator /> : null}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        {writable && pending.length > 0 ? (
          <SheetFooter>
            <Button disabled={busy} onClick={onSubmit}>
              <SendIcon data-icon="inline-start" />让 AI 修改
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function DecisionConfirmation({
  mode,
  count,
  busy,
  onOpenChange,
  onConfirm,
}: {
  mode: ConfirmMode
  count: number
  busy: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const accepting = mode === 'accept'
  return (
    <AlertDialog open={mode != null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {accepting ? '接受本轮交付？' : '提交修改清单？'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {accepting
              ? '接受后本轮将变为只读，之后可以归档。'
              : `将 ${count} 项意见交给 AI，提交后本轮将变为只读。`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>取消</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={onConfirm}>
            {accepting ? '确认接受' : '确认提交'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function MarkdownPreview({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const lines = text.split(/\r?\n/)
  return (
    <div className={cn('flex flex-col gap-2 text-sm leading-6', className)}>
      {lines.map((line, index) => {
        const key = `${index}-${line}`
        if (line.trim() === '') return <span key={key} className="h-1" />
        if (/^#{1,3}\s/.test(line)) {
          return (
            <p key={key} className="font-semibold">
              {renderInline(line.replace(/^#{1,3}\s+/, ''))}
            </p>
          )
        }
        if (/^[-*]\s/.test(line)) {
          return (
            <p key={key} className="pl-4 before:mr-2 before:content-['•']">
              {renderInline(line.replace(/^[-*]\s+/, ''))}
            </p>
          )
        }
        if (/^>\s?/.test(line)) {
          return (
            <p key={key} className="border-l-2 pl-3 text-muted-foreground">
              {renderInline(line.replace(/^>\s?/, ''))}
            </p>
          )
        }
        return <p key={key}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    const key = `${index}-${part}`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={key}
          className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function AttachmentPreview({
  src,
  onRemove,
}: {
  src: string
  onRemove: () => void
}) {
  return (
    <div className="group relative size-20 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
      <img src={src} alt="意见附件" className="size-full object-cover" />
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label="移除图片"
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </div>
  )
}

function AttachmentStrip({
  images,
  className,
}: {
  images: readonly string[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {images.map((src) => (
        <a
          key={src}
          href={src}
          target="_blank"
          rel="noreferrer"
          className="size-16 overflow-hidden rounded-lg bg-muted outline-none ring-1 ring-border focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <img src={src} alt="意见附件" className="size-full object-cover" />
        </a>
      ))}
    </div>
  )
}

function StatusBadge({
  status,
  live,
}: {
  status: Decision['status']
  live: boolean
}) {
  const label =
    status === 'accepted'
      ? '已接受'
      : status === 'rejected'
        ? '待修改已提交'
        : '待签核'
  return (
    <Badge variant={status === 'pending' ? 'outline' : 'secondary'}>
      {label}
      {live ? '' : ' · 只读'}
    </Badge>
  )
}

function CaseStatusBadge({
  status,
  flagged,
}: {
  status: string
  flagged: boolean
}) {
  return (
    <Badge variant={flagged ? 'outline' : 'secondary'}>
      {flagged ? '待修改' : caseStatusLabel(status)}
    </Badge>
  )
}

/** 用图标和文字共同表达案例状态，不依赖颜色或截图缩略图。 */
function CaseStatusIcon({ status, flagged }: { status: string; flagged: boolean }) {
  if (flagged) return <MessageSquareIcon aria-label="待修改" />
  if (status === 'pass' || status === '通过') {
    return <CheckCircle2Icon aria-label="通过" />
  }
  if (status === 'blocked' || status === '受阻') {
    return <CircleAlertIcon aria-label="受阻" />
  }
  return <CircleDashedIcon aria-label={caseStatusLabel(status)} />
}

function labelFor(id: string, cases: CaseItem[]): string {
  return cases.find((item) => item.id === id)?.name || id
}

/** 从已保存意见创建可跨断点复用的编辑草稿。 */
function createOpinionDraft(initial: DecisionItem | undefined): OpinionDraft {
  return {
    comment: initial?.comment ?? '',
    keptImages: [...(initial?.images ?? [])],
    files: [],
    tab: 'edit',
  }
}

/** 解释当前检查器为何只读。 */
function readOnlyReason(
  viewingLatest: boolean,
  status: Decision['status'],
): string {
  if (!viewingLatest) return '历史轮次只读。切回最新一轮才能填写意见。'
  if (status !== 'pending') return '本轮决定已经提交，不能继续修改。'
  return '当前为只读模式，请启动本机签核服务。'
}
