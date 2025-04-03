import type { PostResponseType } from '@base/services/interfaces/post.interface'
import { atomWithReset } from 'jotai/utils'

export const postAtom = atomWithReset<PostResponseType | null>(null)
