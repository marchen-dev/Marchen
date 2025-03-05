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
  GetUserResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserRegisterRequestType,
}
