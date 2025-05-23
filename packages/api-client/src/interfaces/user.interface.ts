interface UserGetResponseType {
  id: string
  name: string
  nickname: string
  email: string
  avatar: string
  introduce: string | null
  social: Record<string, string>
  created: Date
}

interface UserMasterResponseType {
  id: string
  name: string
  nickname: string
  email: string
  avatar: string
  social: Record<string, string>
  introduce: string | null
  created: Date
}

interface UserRegisterRequestType {
  name: string
  password: string
  email: string
}

interface UserLoginRequestType {
  name: string
  password: string
  captchaToken: string
}

interface UserPatchMasterRequestType {
  name?: string
  nickname?: string
  email?: string
  avatar?: string
  introduce?: string | null
  social?: Record<string, string>
}

interface UserLoginResponseType {
  token: string
  expiresIn: number
}

export type {
  UserGetResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserMasterResponseType,
  UserPatchMasterRequestType,
  UserRegisterRequestType,
}
