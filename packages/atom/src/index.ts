import { createStore } from 'jotai'

const store = createStore()
export const jotaiStore = store

export * from './hydration'
export * from './selectors/viewport'
export * from './viewport'
