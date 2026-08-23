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
  ImageIcon,
  ImagePlusIcon,
  Maximize2Icon,
  MenuIcon,
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
import { cn } from '@/lib/utils'

type ConfirmMode = 'accept' | 'reject' | null
type ImageMode = 'fit' | 'original'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [changesOpen, setChangesOpen] = useState(false)
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null)

  const rounds = embedded.rounds
  const latestPosition = Math.max(0, rounds.length - 1)
  const selectedRound = rounds[roundPosition]
  const cases = selectedRound?.cases ?? []
  const current = cases[caseIndex] ?? cases[0]
  const viewingLatest = roundPosition === latestPosition
  const writable = isReviewWritable(live, decision.status, viewingLatest)
  const pending = decision.items

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setCaseIndex((value) => Math.min(cases.length - 1, value + 1))
      } else if (event.key === 'ArrowLeft') {
        setCaseIndex((value) => Math.max(0, value - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const selectCase = (index: number) => {
    setCaseIndex(index)
    setSidebarOpen(false)
  }

  const jumpToPending = (id: string) => {
    setRoundPosition(latestPosition)
    const nextIndex = rounds[latestPosition]?.cases.findIndex(
      (item) => item.id === id,
    )
    setCaseIndex(nextIndex != null && nextIndex >= 0 ? nextIndex : 0)
    setChangesOpen(false)
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
    <div className="flex h-full flex-col bg-background text-foreground">
      <AppHeader
        requirement={embedded.requirement}
        round={selectedRound}
        roundPosition={roundPosition}
        roundCount={rounds.length}
        decision={decision}
        live={live}
        pendingCount={pending.length}
        writable={writable}
        onOpenSidebar={() => setSidebarOpen(true)}
        onPreviousRound={() => {
          setRoundPosition((value) => Math.max(0, value - 1))
          setCaseIndex(0)
        }}
        onNextRound={() => {
          setRoundPosition((value) => Math.min(latestPosition, value + 1))
          setCaseIndex(0)
        }}
        onPrimaryAction={() => {
          if (pending.length === 0) setConfirmMode('accept')
          else setChangesOpen(true)
        }}
      />

      <main className="grid min-h-0 flex-1 grid-cols-[17rem_minmax(0,1fr)] max-[900px]:grid-cols-1">
        <CaseSidebar
          cases={cases}
          selectedIndex={caseIndex}
          pending={pending}
          className="border-r max-[900px]:hidden"
          onSelect={selectCase}
        />

        <ScrollArea className="min-h-0 bg-background">
          {current && selectedRound ? (
            <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-8 py-8 max-[720px]:gap-8 max-[720px]:px-4 max-[720px]:py-5">
              <CaseHeading
                item={current}
                index={caseIndex}
                total={cases.length}
                pending={pending.some((item) => item.id === current.id)}
                onPrevious={() =>
                  setCaseIndex((value) => Math.max(0, value - 1))
                }
                onNext={() =>
                  setCaseIndex((value) => Math.min(cases.length - 1, value + 1))
                }
              />
              <EvidenceViewer item={current} roundIndex={selectedRound.index} />
              <section
                aria-labelledby="ai-review-title"
                className="flex flex-col gap-3"
              >
                <SectionLabel
                  id="ai-review-title"
                  index="AI"
                  title="检查说明"
                />
                <div className="border-l-2 pl-5">
                  <p className="text-base leading-7">
                    {current.observation || '这一轮没有留下补充说明。'}
                  </p>
                </div>
              </section>
              <HistoryTimeline
                rounds={rounds}
                caseId={current.id}
                selectedRoundIndex={selectedRound.index}
              />
              <OpinionComposer
                key={`${selectedRound.index}-${current.id}`}
                item={current}
                initial={pending.find((item) => item.id === current.id)}
                writable={writable}
                busy={busy}
                readOnlyReason={
                  !viewingLatest
                    ? '历史轮次只读。切回最新一轮才能填写意见。'
                    : decision.status !== 'pending'
                      ? '本轮决定已经提交，不能继续修改。'
                      : '当前为只读模式，请启动本机签核服务。'
                }
                onSave={saveOpinion}
                onWithdraw={withdrawOpinion}
              />
            </article>
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
        </ScrollArea>
      </main>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <SheetHeader>
            <SheetTitle>验收项</SheetTitle>
            <SheetDescription>选择要查看的证据。</SheetDescription>
          </SheetHeader>
          <CaseSidebar
            cases={cases}
            selectedIndex={caseIndex}
            pending={pending}
            className="flex-1"
            onSelect={selectCase}
          />
        </SheetContent>
      </Sheet>

      <ChangesSheet
        open={changesOpen}
        onOpenChange={setChangesOpen}
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
    </div>
  )
}

function AppHeader({
  requirement,
  round,
  roundPosition,
  roundCount,
  decision,
  live,
  pendingCount,
  writable,
  onOpenSidebar,
  onPreviousRound,
  onNextRound,
  onPrimaryAction,
}: {
  requirement: string
  round: Round | undefined
  roundPosition: number
  roundCount: number
  decision: Decision
  live: boolean
  pendingCount: number
  writable: boolean
  onOpenSidebar: () => void
  onPreviousRound: () => void
  onNextRound: () => void
  onPrimaryAction: () => void
}) {
  return (
    <header className="flex min-h-16 shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="min-[901px]:hidden"
        aria-label="打开验收项"
        onClick={onOpenSidebar}
      >
        <MenuIcon />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-tight">交付验收</p>
          <StatusBadge status={decision.status} live={live} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {requirement || round?.title || '未写验收目标'}
        </p>
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
  return (
    <Sidebar className={className}>
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
                      aria-current={
                        index === selectedIndex ? 'page' : undefined
                      }
                      onClick={() => onSelect(index)}
                    >
                      <Thumb item={item} flagged={flagged} />
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
      <Separator />
      <SidebarFooter>
        <p className="text-xs leading-relaxed text-muted-foreground">
          使用 ← → 快速切换验收项
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}

function CaseHeading({
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
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs tabular-nums text-muted-foreground">
          CASE {String(index + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {item.name || item.id}
          </h1>
          <CaseStatusBadge status={item.status} flagged={pending} />
        </div>
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

function EvidenceViewer({
  item,
  roundIndex,
}: {
  item: CaseItem
  roundIndex: number
}) {
  const images = imageEvidence(item)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ImageMode>('fit')
  const [fullscreen, setFullscreen] = useState(false)
  const current = images[active] ?? images[0]

  useEffect(() => {
    setActive(0)
    setMode('fit')
  }, [item.id, roundIndex])

  return (
    <section aria-labelledby="evidence-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel id="evidence-title" index="01" title="截图证据" />
        {current ? (
          <div className="flex items-center gap-2">
            <ToggleGroup
              size="sm"
              value={[mode]}
              onValueChange={(value) => {
                const next = value[0] as ImageMode | undefined
                if (next) setMode(next)
              }}
            >
              <ToggleGroupItem value="fit">适应</ToggleGroupItem>
              <ToggleGroupItem value="original">原始尺寸</ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="全屏查看"
              onClick={() => setFullscreen(true)}
            >
              <Maximize2Icon />
            </Button>
          </div>
        ) : null}
      </div>

      {current ? (
        <>
          <div className="flex h-[min(56vh,34rem)] items-center justify-center overflow-auto rounded-xl bg-muted p-3 ring-1 ring-border">
            <img
              src={current.path}
              alt={`${item.name} 截图 ${active + 1}`}
              className={cn(
                mode === 'fit'
                  ? 'max-h-full max-w-full object-contain'
                  : 'max-w-none self-start object-none',
              )}
            />
          </div>
          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image.path}-${index}`}
                  type="button"
                  aria-current={index === active ? 'true' : undefined}
                  aria-label={`查看第 ${index + 1} 张截图`}
                  className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted outline-none ring-1 ring-border transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 aria-current:ring-2 aria-current:ring-foreground"
                  onClick={() => setActive(index)}
                >
                  <img
                    src={image.path}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <EvidenceEmpty observation={item.observation} />
      )}

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className="h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] p-3"
          showCloseButton
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{item.name} 的截图证据</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 items-center justify-center overflow-auto rounded-lg bg-muted">
            {current ? (
              <img src={current.path} alt={item.name} className="max-w-none" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
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
      <SectionLabel id="history-title" index="02" title="验收记录" />
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
  writable,
  busy,
  readOnlyReason,
  onSave,
  onWithdraw,
}: {
  item: CaseItem
  initial: DecisionItem | undefined
  writable: boolean
  busy: boolean
  readOnlyReason: string
  onSave: (
    comment: string,
    keptImages: string[],
    files: File[],
  ) => Promise<boolean>
  onWithdraw: (id: string) => Promise<void>
}) {
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [keptImages, setKeptImages] = useState<string[]>([
    ...(initial?.images ?? []),
  ])
  const [files, setFiles] = useState<File[]>([])
  const [tab, setTab] = useState('edit')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  )

  useEffect(() => {
    setComment(initial?.comment ?? '')
    setKeptImages([...(initial?.images ?? [])])
  }, [initial])

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
    setFiles((current) => [...current, ...next])
  }

  if (!writable) {
    return (
      <section aria-labelledby="opinion-title" className="flex flex-col gap-3">
        <SectionLabel id="opinion-title" index="03" title="你的意见" />
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
        <SectionLabel id="opinion-title" index="03" title="你的意见" />
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
          value={tab}
          onValueChange={(value) => setTab(String(value))}
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
                  value={comment}
                  aria-invalid={Boolean(error)}
                  className="min-h-36 resize-y border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                  placeholder="说明哪里不符合预期，以及希望改成什么样。"
                  onChange={(event) => setComment(event.target.value)}
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
            {comment.trim() ? (
              <MarkdownPreview text={comment} />
            ) : (
              <p className="text-sm text-muted-foreground">
                还没有可预览的内容。
              </p>
            )}
          </TabsContent>
        </Tabs>

        {keptImages.length + files.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t p-3">
            {keptImages.map((src) => (
              <AttachmentPreview
                key={src}
                src={src}
                onRemove={() =>
                  setKeptImages((images) =>
                    images.filter((image) => image !== src),
                  )
                }
              />
            ))}
            {previews.map((src, index) => (
              <AttachmentPreview
                key={src}
                src={src}
                onRemove={() =>
                  setFiles((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
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
                if (comment.trim() === '') {
                  setError('请填写修改说明')
                  return
                }
                setError('')
                void onSave(comment, keptImages, files).then((saved) => {
                  if (saved) setFiles([])
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

function SectionLabel({
  id,
  index,
  title,
}: {
  id: string
  index: string
  title: string
}) {
  return (
    <div id={id} className="flex items-center gap-3">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {index}
      </span>
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
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

function Thumb({ item, flagged }: { item: CaseItem; flagged: boolean }) {
  const src = imageEvidence(item)[0]?.path
  return (
    <span className="relative block aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground">
          <ImageIcon />
        </span>
      )}
      {flagged ? (
        <span className="absolute top-1 right-1 size-2 rounded-full bg-foreground ring-2 ring-background" />
      ) : null}
    </span>
  )
}

function labelFor(id: string, cases: CaseItem[]): string {
  return cases.find((item) => item.id === id)?.name || id
}
