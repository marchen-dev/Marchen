import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { atomWithReset } from 'jotai/utils'

export const postAtom = atomWithReset<PostResponseType | null>(null)
