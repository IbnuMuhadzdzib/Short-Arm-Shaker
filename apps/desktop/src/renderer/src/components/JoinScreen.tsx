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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <h1 className="text-5xl font-bold">🎲 Yahtzee</h1>
        <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
          <form onSubmit={handleSubmit} className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama kamu</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan nama"
                className="input input-bordered"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Room ID</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan room ID"
                className="input input-bordered"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Join Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}