import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents } from '@yahtzee/shared'
import { getRoom, createRoom } from './game/rooms'
import { rollDice } from './game/dice'
import { calculateScore } from './game/scoring'

const httpServer = createServer()

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*'
  }
})

const PORT = 17510
const TOTAL_TURNS = 13

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

  socket.on('rollDice', (holdDurationMs) => {
    const roomId = Array.from(socket.rooms)[1]
    if (!roomId) return

    const state = getRoom(roomId)
    if (!state) return

    if (state.rollsLeftInTurn <= 0) {
      socket.emit('errorMessage', 'tidak ada kesempatan roll tersisa')
      return
    }

    const result = rollDice(state.dice, holdDurationMs)
    state.dice = result.dice
    state.rollsLeftInTurn -= 1

    io.to(roomId).emit('gameStateUpdate', state)

    if (result.gambleResult !== 'none') {
      io.to(roomId).emit('gambleResult', result.gambleResult)
    }
  })

  socket.on('toggleHold', (diceId) => {
    const roomId = Array.from(socket.rooms)[1]
    if (!roomId) return
    const state = getRoom(roomId)
    if (!state) return

    const die = state.dice.find((d) => d.id === diceId)
    if (die) die.isHeld = !die.isHeld

    io.to(roomId).emit('gameStateUpdate', state)
  })

  socket.on('claimScore', (category) => {
    const roomId = Array.from(socket.rooms)[1]
    if (!roomId) return

    const state = getRoom(roomId)
    if (!state) return

    // Must be this player's turn
    const player = state.players.find((p) => p.id === socket.id)
    if (!player || !player.isCurrentTurn) {
      socket.emit('errorMessage', 'Bukan giliran kamu!')
      return
    }

    // Must have rolled at least once (rollsLeftInTurn < 3)
    if (state.rollsLeftInTurn >= 3) {
      socket.emit('errorMessage', 'Kocok dadu dulu sebelum pilih skor!')
      return
    }

    // Category must not be claimed yet
    if (player.scoreCard[category] !== undefined) {
      socket.emit('errorMessage', 'Kategori ini sudah diisi!')
      return
    }

    // Calculate and record score
    const score = calculateScore(category, state.dice)
    player.scoreCard[category] = score

    // Advance to next player
    const currentIndex = state.players.findIndex((p) => p.id === socket.id)
    const nextIndex = (currentIndex + 1) % state.players.length
    const currentPlayer = state.players[currentIndex]
    const nextPlayer = state.players[nextIndex]
    if (currentPlayer) currentPlayer.isCurrentTurn = false
    if (nextPlayer) nextPlayer.isCurrentTurn = true

    // Increment turn counter (only when it wraps back to first player)
    if (nextIndex === 0 || state.players.length === 1) {
      state.currentTurn += 1
    }

    // Reset dice for next turn
    state.dice = state.dice.map((d) => ({ ...d, isHeld: false }))
    state.rollsLeftInTurn = 3

    // Check game over
    if (state.currentTurn > TOTAL_TURNS) {
      state.status = 'finished'
    }

    io.to(roomId).emit('gameStateUpdate', state)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Yahtzee server running on port ${PORT}`)
})