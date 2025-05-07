import { Delete, Get, Patch, Post } from '../fetch'
import type {
  FriendCreateRequestType,
  FriendResponseType,
  FriendStatus,
  FriendUpdateRequestType,
} from '../interfaces/friend.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const friends = {
  post(params: FriendCreateRequestType) {
    return Post(`/friend`, params)
  },
  postByMaster(params: FriendUpdateRequestType) {
    return Post(`/friend/master`, params)
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
  patch(id: string, params: FriendUpdateRequestType) {
    return Patch(`/friend/${id}`, params)
  },
}
