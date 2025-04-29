import { Get, Patch, Post } from '../fetch'
import type {
  UserGetResponseType,
  UserLoginRequestType,
  UserLoginResponseType,
  UserMasterResponseType,
  UserPatchMasterRequestType,
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
  patchMaster(user: UserPatchMasterRequestType) {
    return Patch('/user/master', user)
  },
}
