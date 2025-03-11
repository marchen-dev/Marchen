import 'dayjs/locale/zh-cn'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
export const relativeTimeToNow = (date: Date | string): string => {
  return dayjs().to(dayjs(date))
}
