'use clienet'

import {
  Button,
  InputWithIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@marchen/components/ui'
import { debounce } from 'lodash-es'
import * as React from 'react'

interface InputWithListProps {
  values?: Record<string, string> | null
  onChange: (values: Record<string, string>) => void
  list: string[]
}

const InputWithList = React.memo(
  ({ values, onChange, list }: InputWithListProps) => {
    const [selectedItems, setSelectedItems] = React.useState(
      values
        ? Object.keys(values).map((key) => ({
            key,
            value: values[key],
          }))
        : [],
    )
    const deferredSelectedItems = React.useDeferredValue(selectedItems)

    const handleChange = React.useCallback(
      (newItems: typeof selectedItems) => {
        const debouncedFn = debounce((items: typeof selectedItems) => {
          onChange(
            items.reduce(
              (
                acc: Record<string, string>,
                item: { key: string; value: string },
              ) => {
                acc[item.key] = item.value
                return acc
              },
              {} as Record<string, string>,
            ),
          )
        }, 300)
        debouncedFn(newItems)
      },
      [onChange],
    )

    return (
      <InputWithListItem
        selectedItems={deferredSelectedItems}
        setSelectedItems={setSelectedItems}
        handleChange={handleChange}
        list={list}
      />
    )
  },
)

const InputWithListItem: React.FC<{
  selectedItems: Array<{ key: string; value: string }>
  setSelectedItems: (items: Array<{ key: string; value: string }>) => void
  handleChange: (items: Array<{ key: string; value: string }>) => void
  list: string[]
}> = React.memo(({ selectedItems, setSelectedItems, handleChange, list }) => {
  const disableAdd = selectedItems.length >= list.length
  return (
    <div className="space-y-2">
      {selectedItems.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <Select
            defaultValue={item.key}
            onValueChange={(value) => {
              const currentSelectedItem = selectedItems.map((_item) => {
                if (_item.key === item.key) {
                  return {
                    ..._item,
                    key: value,
                  }
                }
                return _item
              })
              setSelectedItems(currentSelectedItem)
              handleChange(currentSelectedItem)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              {list.map((icon) => (
                <SelectItem
                  key={icon}
                  value={icon}
                  disabled={selectedItems.some((item) => item.key === icon)}
                >
                  {icon}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <InputWithIcon
            icon={
              <i
                className="icon-[mingcute--delete-2-line] cursor-pointer"
                onClick={() => {
                  const newItems = selectedItems.filter(
                    (_item) => item.key !== _item.key,
                  )
                  setSelectedItems(newItems)
                  handleChange(newItems)
                }}
              />
            }
            defaultValue={item.value}
            onChange={(e) => {
              const currentSelectedItem = selectedItems.map((_item) => {
                if (_item.key === item.key) {
                  return { ..._item, value: e.target.value }
                }
                return _item
              })
              setSelectedItems(currentSelectedItem)
              handleChange(currentSelectedItem)
            }}
          />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => {
          const currentSelectedKeys = new Set(
            selectedItems.map((item) => item.key),
          )
          const newKey = list.find((item) => !currentSelectedKeys.has(item))

          if (!newKey) {
            return
          }

          const newItems = [
            ...selectedItems,
            {
              key: newKey,
              value: '',
            },
          ]
          setSelectedItems(newItems)
          handleChange(newItems)
        }}
        disabled={disableAdd}
      >
        <i className="icon-[mingcute--add-line]" />
        添加
      </Button>
    </div>
  )
})

export { InputWithList }
InputWithList.displayName = 'InputWithList'
