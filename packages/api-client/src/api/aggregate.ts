import { Get } from '../fetch'
import type { GetAggregateResponseType } from '../interfaces/aggregate.interface'

export const aggregate = {
  get() {
    return Get<GetAggregateResponseType>('/aggregate')
  },
}
