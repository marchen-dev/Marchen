import 'server-only'

import { headers } from 'next/headers'

export const getPathNameOnServer = () => headers().get(REQUEST_PATHNAME)
