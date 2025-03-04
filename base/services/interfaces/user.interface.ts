interface GetUserResponseType {
  id: string
  name: string
  nickname: string
  email: string
  introduce: string | null
  created: Date
}

interface UserRegisterRequestType {
  name: string
  password: string
  email: string
}

export type { GetUserResponseType, UserRegisterRequestType }
