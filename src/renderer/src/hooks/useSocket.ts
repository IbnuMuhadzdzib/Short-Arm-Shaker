import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents, GameState } from '@yahtzee/shared'

const SERVER_URL = 'http://localhost:17510'

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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

    return () => {
      socket.disconnect()
    }
  }, [])

    const joinRoom = (roomId: string, playerName: string) => {
    socketRef.current?.emit('joinRoom', roomId, playerName)
  }

  const rollDice = () => {
    socketRef.current?.emit('rollDice')
  }

  return { gameState, isConnected, joinRoom, rollDice }
}