import { Button, Label, Textarea } from '@marchen/components/ui'

export const AdvancedSetting = () => {
  return (
    <div>
      <AISummary />
    </div>
  )
}

const AISummary = () => {
  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="message">AI 摘要</Label>
        <Button variant="outline" size="sm">
          <i className="icon-[mingcute--refresh-3-line] size-4" />
          点击生成
        </Button>
      </div>
      <Textarea
        className="h-[200px]"
        placeholder="点击按钮生成摘要"
        id="message"
      />
    </div>
  )
}
