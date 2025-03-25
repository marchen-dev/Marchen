export interface PaginationRequestType {
  take?: number
  cursor?: string
}

export interface DataWrapper<T> {
  data: T
}
