import type { GameState } from '@yahtzee/shared'

const rooms = new Map<string, GameState>()

export function getRoom(roomId: string): GameState | undefined {
  return rooms.get(roomId)
}

export function createRoom(roomId: string, isDebug: boolean): GameState {
  const newState: GameState = {
    roomId,
    players: [],
    dice: Array.from({ length: 5 }, (_, i) => ({
      id: `dice-${i}`,
      value: 1,
      isHeld: false
    })),
    rollsLeftInTurn: 3,
    currentTurn: 1,
    status: 'waiting',
    isDebug
  }
  rooms.set(roomId, newState)
  return newState
}