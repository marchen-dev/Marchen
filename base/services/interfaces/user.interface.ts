interface UserGetResponseType {
  id: string
  name: string
  nickname: string
  email: string
  avatar: string
  introduce: string | null
  social: null
  created: Date
}

interface UserMasterResponseType {
  id: string
  name: string
  nickname: string
  email: string
  avatar: string
  social: null
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

interface UserLoginResponseType {
  token: string
  expiresIn: number
}

export type {
  UserGetResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserMasterResponseType,
  UserRegisterRequestType,
}
