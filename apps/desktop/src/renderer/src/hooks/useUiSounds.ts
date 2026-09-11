import { useCallback, useRef } from 'react'
import { Howl } from 'howler'

import hoverUrl from '../sounds/ui/ui-hover.mp3'
import selectUrl from '../sounds/ui/ui-select.mp3'
import readyUrl from '../sounds/ui/ui-ready.mp3'
import unreadyUrl from '../sounds/ui/ui-unready.mp3'

export function useUiSounds() {
  const hover = useRef<Howl>()
  const select = useRef<Howl>()
  const ready = useRef<Howl>()
  const unready = useRef<Howl>()

  if (!hover.current) hover.current = new Howl({ src: [hoverUrl], volume: 0.25 })
  if (!select.current) select.current = new Howl({ src: [selectUrl], volume: 0.5 })
  if (!ready.current) ready.current = new Howl({ src: [readyUrl], volume: 0.7 })
  if (!unready.current) unready.current = new Howl({ src: [unreadyUrl], volume: 0.5 })

  return {
    playHover: useCallback(() => hover.current?.play(), []),
    playSelect: useCallback(() => select.current?.play(), []),
    playReady: useCallback(() => ready.current?.play(), []),
    playUnready: useCallback(() => unready.current?.play(), [])
  }
}