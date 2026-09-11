import type { CSSProperties } from 'react'
import type { Player, CharacterId } from '@yahtzee/shared'
import { CHARACTERS, getCharacter } from '../characters'
import { useUiSounds } from '../hooks/useUiSounds'
import './CharacterSelectScreen.css'

interface CharacterSelectScreenProps {
  roomId: string
  players: Player[]
  myPlayerId: string
  isDebug: boolean
  onSelectCharacter: (id: CharacterId) => void
  onSetReady: (ready: boolean) => void
}

const DEBUG_BOT_CHARACTER: CharacterId = 'rex'

export function CharacterSelectScreen({
  roomId,
  players,
  myPlayerId,
  isDebug,
  onSelectCharacter,
  onSetReady
}: CharacterSelectScreenProps) {
  const { playHover, playSelect, playReady, playUnready } = useUiSounds()

  const me = players.find((p) => p.id === myPlayerId)
  const realOpponent = players.find((p) => p.id !== myPlayerId)

  const opponentDisplay = realOpponent
    ? {
        name: realOpponent.name,
        character: realOpponent.character,
        isReady: realOpponent.isReady,
        isBot: false
      }
    : isDebug
      ? { name: 'Rex (CPU)', character: DEBUG_BOT_CHARACTER, isReady: true, isBot: true }
      : null

  const isLocked = me?.isReady ?? false

  function handlePick(id: CharacterId) {
    if (isLocked) return
    playSelect()
    onSelectCharacter(id)
  }

  function handleReadyToggle() {
    if (!me?.character) return
    if (me.isReady) {
      playUnready()
      onSetReady(false)
    } else {
      playReady()
      onSetReady(true)
    }
  }

  return (
    <div className="cs-root">
      <div className="cs-stripe stripe-a" />
      <div className="cs-stripe stripe-b" />
      <div className="cs-stripe stripe-c" />

      <div className="cs-header">
        <h1 className="cs-title">PILIH KARAKTER</h1>
        <div className="cs-room-chip">ROOM {roomId}</div>
      </div>

      <div className="cs-grid">
        {CHARACTERS.map((char) => {
          const pickedByMe = me?.character === char.id
          const pickedByOpponent = opponentDisplay?.character === char.id
          return (
            <button
              key={char.id}
              type="button"
              disabled={isLocked}
              onMouseEnter={playHover}
              onClick={() => handlePick(char.id)}
              className={`cs-card ${pickedByMe ? 'cs-card-picked' : ''} ${isLocked ? 'cs-card-locked' : ''}`}
              style={{ '--char-color': char.accentColor } as CSSProperties}
            >
              <div className="cs-card-glow" />
              <img src={char.portrait} className="cs-card-portrait" draggable={false} />
              <div className="cs-card-plate">{char.label}</div>
              {pickedByMe && <div className="cs-tag cs-tag-you">KAMU</div>}
              {pickedByOpponent && (
                <div className="cs-tag cs-tag-opp">{opponentDisplay?.isBot ? 'CPU' : 'LAWAN'}</div>
              )}
            </button>
          )
        })}
      </div>

      <div className="cs-footer">
        <PlayerPlaque
          label="KAMU"
          name={me?.name ?? '...'}
          character={me?.character ?? null}
          isReady={me?.isReady ?? false}
        />

        <button
          type="button"
          disabled={!me?.character}
          onClick={handleReadyToggle}
          onMouseEnter={playHover}
          className={`cs-ready-btn ${me?.isReady ? 'cs-ready-on' : ''}`}
        >
          {me?.isReady ? '✓ SIAP!' : me?.character ? 'TEKAN UNTUK SIAP' : 'PILIH KARAKTER DULU'}
        </button>

        {opponentDisplay && (
          <PlayerPlaque
            label={opponentDisplay.isBot ? 'CPU' : 'LAWAN'}
            name={opponentDisplay.name}
            character={opponentDisplay.character}
            isReady={opponentDisplay.isReady}
          />
        )}
      </div>

      {!opponentDisplay && <p className="cs-waiting-hint">Menunggu pemain lain bergabung...</p>}
    </div>
  )
}

function PlayerPlaque({
  label,
  name,
  character,
  isReady
}: {
  label: string
  name: string
  character: CharacterId | null
  isReady: boolean
}) {
  const char = character ? getCharacter(character) : null
  return (
    <div className={`cs-plaque ${isReady ? 'cs-plaque-ready' : ''}`}>
      <div className="cs-plaque-avatar">
        {char ? <img src={char.portrait} draggable={false} /> : <span className="cs-plaque-empty">?</span>}
      </div>
      <div className="cs-plaque-info">
        <span className="cs-plaque-label">{label}</span>
        <span className="cs-plaque-name">{name}</span>
      </div>
      <div className="cs-plaque-status">{isReady ? '✓' : '…'}</div>
    </div>
  )
}