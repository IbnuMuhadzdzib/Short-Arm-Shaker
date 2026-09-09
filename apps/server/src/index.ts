import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents } from '@yahtzee/shared'
import { getRoom, createRoom } from './game/rooms'
import { rollDice } from './game/dice'

const httpServer = createServer()

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*'
  }
})

const PORT = 17510

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('joinRoom', (roomId, playerName) => {
    let state = getRoom(roomId)
    if (!state) {
      state = createRoom(roomId)
    }

    const newPlayer = {
      id: socket.id,
      name: playerName,
      scoreCard: {},
      isCurrentTurn: state.players.length === 0
    }

    state.players.push(newPlayer)
    socket.join(roomId)

    io.to(roomId).emit('gameStateUpdate', state)
  })

  socket.on('rollDice', () => {
    const roomId = Array.from(socket.rooms)[1]
    if (!roomId) return

    const state = getRoom(roomId)
    if (!state) return

    if (state.rollsLeftInTurn <= 0) {
      socket.emit('errorMessage', 'Tidak ada kesempatan roll tersisa')
      return
    }

    state.dice = rollDice(state.dice)
    state.rollsLeftInTurn -= 1

    io.to(roomId).emit('gameStateUpdate', state)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Yahtzee server running on port ${PORT}`)
})