interface FriendResponseType {
  id: string
  name: string
  url: string
  avatar: string
  introduce: string
  status: FriendStatus
  email: string
  created: Date
}

interface FriendCreateRequestType {
  name: string
  url: string
  avatar: string
  introduce: string
  email: string
  captchaToken?: string
}

interface FriendUpdateRequestType {
  name?: string
  url?: string
  avatar?: string
  introduce?: string
  email?: string
}

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'ARCHIVED'

export type {
  FriendCreateRequestType,
  FriendResponseType,
  FriendUpdateRequestType,
}
