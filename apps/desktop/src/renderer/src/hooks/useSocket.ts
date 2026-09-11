import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents, GameState, ScoreCategory, CharacterId } from '@yahtzee/shared'

const SERVER_URL = 'http://localhost:17510'

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [myPlayerId, setMyPlayerId] = useState<string>('')
  const [gambleResult, setGambleResult] = useState<'good' | 'bad' | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL)
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setMyPlayerId(socket.id ?? '')
    })

        socket.on('errorMessage', (message) => {
      setErrorMessage(message)
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

  const joinRoom = (roomId: string, playerName: string, character: CharacterId) => {
    socketRef.current?.emit('joinRoom', roomId, playerName, character)
  }

  const toggleHold = (diceId: string) => {
    socketRef.current?.emit('toggleHold', diceId)
  }

  const rollDice = (holdDurationMs: number) => {
    socketRef.current?.emit('rollDice', holdDurationMs)
  }

  const claimScore = (category: ScoreCategory) => {
    socketRef.current?.emit('claimScore', category)
  }

  const clearGambleResult = () => setGambleResult(null)

    const clearError = () => setErrorMessage(null)

  return {
    gameState,
    isConnected,
    myPlayerId,
    joinRoom,
    rollDice,
    toggleHold,
    claimScore,
    gambleResult,
    clearGambleResult,
    errorMessage,
    clearError
  }
}