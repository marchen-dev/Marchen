interface FriendResponseType {
  id: string
  name: string
  url: string
  avatar: string
  introduce: string
  created: Date
}

interface FriendCreateRequestType {
  name: string
  url: string
  avatar: string
  introduce: string
}

interface FriendUpdateRequestType {
  name?: string
  url?: string
  avatar?: string
  introduce?: string
}

export type {
  FriendCreateRequestType,
  FriendResponseType,
  FriendUpdateRequestType,
}
