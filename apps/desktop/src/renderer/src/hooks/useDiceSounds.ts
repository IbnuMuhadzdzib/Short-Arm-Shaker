import { useRef, useCallback } from 'react'
import { Howl } from 'howler'

import shakeLoopUrl from '../sounds/game-scene/shake-loop.mp3'
import impactSoftUrl from '../sounds/game-scene/impact-soft.mp3'
import impactHardUrl from '../sounds/game-scene/impact-hard.mp3'
import gambleTensionUrl from '../sounds/game-scene/gamble-tension.mp3'
import gambleGoodUrl from '../sounds/game-scene/gamble-good.mp3'
import gambleBadUrl from '../sounds/game-scene/gamble-bad.mp3'

// Pre-load impact sounds to avoid cold-start latency on collision
const impactSoftPool = Array.from(
  { length: 4 },
  () => new Howl({ src: [impactSoftUrl], volume: 0.5, preload: true })
)
const impactHardPool = Array.from(
  { length: 4 },
  () => new Howl({ src: [impactHardUrl], volume: 0.8, preload: true })
)
let softPoolIdx = 0
let hardPoolIdx = 0

export function useDiceImpactSound() {
  const lastImpactTime = useRef(0)

  const playImpact = useCallback((intensity: number) => {
    const now = Date.now()
    // Debounce: don't spam sounds faster than 80ms
    if (now - lastImpactTime.current < 80) return
    lastImpactTime.current = now

    const clamped = Math.min(1, Math.max(0, intensity))
    if (clamped < 0.05) return

    if (clamped > 0.5) {
      const sound = impactHardPool[hardPoolIdx % impactHardPool.length]
      hardPoolIdx++
      sound.volume(0.4 + clamped * 0.6)
      sound.stop()
      sound.play()
    } else {
      const sound = impactSoftPool[softPoolIdx % impactSoftPool.length]
      softPoolIdx++
      sound.volume(0.2 + clamped * 0.6)
      sound.stop()
      sound.play()
    }
  }, [])

  return { playImpact }
}

export function useGameSounds() {
  const shakeLoop = useRef<Howl>()
  const gambleTension = useRef<Howl>()

  if (!shakeLoop.current) {
    shakeLoop.current = new Howl({ src: [shakeLoopUrl], loop: true, volume: 0.4, preload: true })
  }
  if (!gambleTension.current) {
    gambleTension.current = new Howl({
      src: [gambleTensionUrl],
      loop: true,
      volume: 0,
      preload: true
    })
  }

  const startShaking = useCallback(() => {
    const shake = shakeLoop.current
    if (!shake) return
    if (!shake.playing()) shake.play()
  }, [])

  const stopShaking = useCallback(() => {
    shakeLoop.current?.stop()
    gambleTension.current?.stop()
    gambleTension.current?.volume(0)
  }, [])

  const updateTension = useCallback((progress: number) => {
    const tension = gambleTension.current
    if (!tension) return
    const vol = Math.min(1, Math.max(0, progress))
    tension.volume(vol)
    if (vol > 0.05 && !tension.playing()) {
      tension.play()
    } else if (vol <= 0 && tension.playing()) {
      tension.stop()
    }
  }, [])

  const playGambleResult = useCallback((result: 'good' | 'bad') => {
    const url = result === 'good' ? gambleGoodUrl : gambleBadUrl
    new Howl({ src: [url], volume: 0.8, preload: true }).play()
  }, [])

  return { startShaking, stopShaking, updateTension, playGambleResult }
}
