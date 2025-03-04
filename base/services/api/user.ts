import { Get, Post } from '../fetch'
import type {
  GetUserResponseType,
  UserRegisterRequestType,
} from '../interfaces/user.interface'

export const user = {
  get() {
    return Get<GetUserResponseType>('/user')
  },
  register(user: UserRegisterRequestType) {
    return Post<GetUserResponseType>('/user/register', user)
  },
}
