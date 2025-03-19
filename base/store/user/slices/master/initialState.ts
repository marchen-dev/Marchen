import type { UserMasterResponseType } from '@base/services/interfaces/user.interface'

export interface MasterStoreState extends UserMasterResponseType {}

export const initialMasterStoreState: MasterStoreState = {
  id: '',
  name: '',
  nickname: '',
  email: '',
  avatar: '',
  introduce: '',
  social: {},
  created: new Date(),
}
