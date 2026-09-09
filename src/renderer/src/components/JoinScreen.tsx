import { useState } from 'react'

interface JoinScreenProps {
  onJoin: (roomId: string, playerName: string) => void
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomId.trim() === '' || playerName.trim() === '') return
    onJoin(roomId.trim(), playerName.trim())
  }

    return (
    <div className="join-screen">
      <h1>Yahtzee</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nama kamu"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button type="submit">Join Game</button>
      </form>
    </div>
  )
}