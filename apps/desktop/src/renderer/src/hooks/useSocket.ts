import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents, GameState } from '@yahtzee/shared'

const SERVER_URL = 'http://localhost:17510'

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
    const [gambleResult, setGambleResult] = useState<'good' | 'bad' | null>(null)

    useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL)
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('gameStateUpdate', (state) => {
      setGameState(state)
    })

        socket.on('gambleResult', (result) => {
      setGambleResult(result)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

    const joinRoom = (roomId: string, playerName: string) => {
    socketRef.current?.emit('joinRoom', roomId, playerName)
  }

    const toggleHold = (diceId: string) => {
    socketRef.current?.emit('toggleHold', diceId)
  }

    const rollDice = (holdDurationMs: number) => {
    socketRef.current?.emit('rollDice', holdDurationMs)
  }

    const clearGambleResult = () => setGambleResult(null)

  return { gameState, isConnected, joinRoom, rollDice, toggleHold, gambleResult, clearGambleResult }
}