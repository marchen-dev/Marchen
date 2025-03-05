import { Get, Post } from '../fetch'
import type {
  GetUserResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserRegisterRequestType,
} from '../interfaces/user.interface'

export const user = {
  get() {
    return Get<GetUserResponseType>('/user')
  },
  register(user: UserRegisterRequestType) {
    return Post('/user/register', user)
  },
  login(user: UserLoginRequestType) {
    return Post<UserLoginResponseType>('/user/login', user)
  },
}
