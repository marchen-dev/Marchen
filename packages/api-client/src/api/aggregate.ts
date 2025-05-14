import { Get } from '../fetch'
import type {
  GetAggregateResponseType,
  GetDashboardResponseType,
} from '../interfaces/aggregate.interface'

export const aggregate = {
  get() {
    return Get<GetAggregateResponseType>('/aggregate')
  },
  getDashboard() {
    return Get<GetDashboardResponseType>('/aggregate/dashboard')
  },
}
