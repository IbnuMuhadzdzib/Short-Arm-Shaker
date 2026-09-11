import { useState } from 'react'
// import { CharacterSelect } from './CharacterSelect'
// import type { CharacterId } from '@yahtzee/shared'
import './JoinScreen.css'

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
    <div className="join-root">
      <div className="join-bg-strip strip-lime" />
      <div className="join-bg-strip strip-yellow" />
      <div className="join-bg-strip strip-cyan" />
      <div className="join-bg-strip strip-pink" />

      <div className="join-card">
        <div className="join-header">
          <span className="join-dice">🎲</span>
          <h1 className="join-title">Yahtzee!</h1>
          <p className="join-sub">Kocok. Lempar. Menang.</p>
        </div>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="join-field">
            <label className="join-label">Nama Kamu</label>
            <input
              type="text"
              placeholder="Siapa namamu?"
              className="join-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div className="join-field">
            <label className="join-label">Room ID</label>
            <input
              type="text"
              placeholder="Kode room"
              className="join-input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          {/* <div className="join-field">
            <label className="join-label">Pilih Karakter</label>
            <CharacterSelect selected={character} onSelect={setCharacter} />
          </div> */}

          <button type="submit" className="join-btn">
            JOIN GAME →
          </button>
        </form>
      </div>
    </div>
  )
}