import { Get } from '../fetch'
import type {
  AnalyzeRequestType,
  AnalyzeResponseType,
} from '../interfaces/analyze.inteface'

export const analyzes = {
  get(params: AnalyzeRequestType) {
    return Get<AnalyzeResponseType>('/analyzes', params)
  },
}
