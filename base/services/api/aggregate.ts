import { Get } from '../fetch'
import type { GetAggregateeResponseType } from '../interfaces/aggregate.interface'

export const aggregate = {
  get() {
    return Get<GetAggregateeResponseType>('/aggregate')
  },
}
