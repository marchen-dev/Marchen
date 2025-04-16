'use client'

import { atom } from 'jotai'
import { useEffect } from 'react'

import { jotaiStore } from '.'

const hydratingAtom = atom(true)

export const hydrating = () => jotaiStore.get(hydratingAtom)

export const HydratingDetector = () => {
  useEffect(() => {
    const cleaner = setTimeout(() => {
      jotaiStore.set(hydratingAtom, false)
    }, 2000)
    return () => {
      clearTimeout(cleaner)
    }
  }, [])
  return null
}
