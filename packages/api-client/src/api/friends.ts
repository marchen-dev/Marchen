import { Delete, Get, Post } from '../fetch'
import type {
  FriendCreateRequestType,
  FriendResponseType,
  FriendStatus,
} from '../interfaces/friend.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const friends = {
  post(params: FriendCreateRequestType) {
    return Post(`/friend`, params)
  },
  get() {
    return Get(`/friend`)
  },
  getAll(params: { status?: FriendStatus }) {
    return Get<DataWrapper<FriendResponseType[]>>(`/friend/all`, params)
  },
  delete(id: string) {
    return Delete(`/friend/${id}`)
  },
  postStatus(id: string, params: { status: FriendStatus }) {
    return Post(`/friend/status/${id}`, params)
  },
}
