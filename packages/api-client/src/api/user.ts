import { Get, Post } from '../fetch'
import type {
  UserGetResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserMasterResponseType,
  UserRegisterRequestType,
} from '../interfaces/user.interface'

export const user = {
  get() {
    return Get<UserGetResponseType>('/user')
  },
  postRegister(user: UserRegisterRequestType) {
    return Post('/user/register', user)
  },
  postLogin(user: UserLoginRequestType) {
    return Post<UserLoginResponseType>('/user/login', user)
  },
  getMaster() {
    return Get<UserMasterResponseType>('/user/master')
  },
}
