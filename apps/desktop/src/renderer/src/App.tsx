import { useState, useRef, useEffect } from 'react'
import { useSocket } from './hooks/useSocket'
import { JoinScreen } from './components/JoinScreen'
import { GameScene } from './scene/GameScene'
import { ScorePanel } from './components/ScorePanel'
import { WaitingRoom } from './components/WaitingRoom'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useGameSounds } from './hooks/useDiceSounds'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'

import { getCharacter } from './characters'

const MAX_HAND_OFFSET_X = 60
const MAX_HAND_OFFSET_Y = 280
const RELEASE_THRESHOLD = 0.65
const GAMBLE_THRESHOLD_MS = 10000

function App() {
  const {
    gameState, isConnected, myPlayerId,
    joinRoom, rollDice, toggleHold, claimScore,
    selectCharacter, setReady,
    gambleResult, clearGambleResult,
  } = useSocket()
  const { startShaking, stopShaking, updateTension, playGambleResult } = useGameSounds()

  const [isShaking, setIsShaking] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [handDrag, setHandDrag] = useState({ x: 0, lift: 0 })
  const sceneContainerRef = useRef<HTMLDivElement>(null)
  const holdStartRef = useRef(0)
  const dragStartRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isShaking) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x
      const rawLift = dragStartRef.current.y - e.clientY

      const clampedX = Math.max(-MAX_HAND_OFFSET_X, Math.min(MAX_HAND_OFFSET_X, dx))
      const clampedLift = Math.max(0, Math.min(MAX_HAND_OFFSET_Y, rawLift))

      setHandDrag({ x: clampedX, lift: clampedLift })

      const holdElapsed = Date.now() - holdStartRef.current
      updateTension(holdElapsed / GAMBLE_THRESHOLD_MS)
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsShaking(false)
      stopShaking()

      const rawLift = dragStartRef.current.y - e.clientY
      const clampedLift = Math.max(0, Math.min(MAX_HAND_OFFSET_Y, rawLift))
      const progress = clampedLift / MAX_HAND_OFFSET_Y

      setHandDrag({ x: 0, lift: 0 })

      if (progress >= RELEASE_THRESHOLD) {
        const holdDuration = Date.now() - holdStartRef.current
        setIsRolling(true)
        rollDice(holdDuration)
        setTimeout(() => setIsRolling(false), 1600)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isShaking])

  useEffect(() => {
    if (!gambleResult) return
    playGambleResult(gambleResult)
    const timeout = setTimeout(() => clearGambleResult(), 3000)
    return () => clearTimeout(timeout)
  }, [gambleResult])

  const handleHandMouseDown = (e: React.MouseEvent) => {
    if (!gameState || isRolling || gameState.rollsLeftInTurn <= 0) return
    setIsShaking(true)
    holdStartRef.current = Date.now()
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    startShaking()
  }

  if (!isConnected) {
    return (
      <>
        <ThemeSwitcher />
        <div className="status">Menghubungkan ke server...</div>
      </>
    )
  }

  if (!gameState) {
    return (
      <>
        <ThemeSwitcher />
        <JoinScreen onJoin={joinRoom} />
      </>
    )
  }

  // Waiting room — not enough players yet
  if (gameState.status === 'waiting') {
    return (
      <>
        <ThemeSwitcher />
        <WaitingRoom
          roomId={gameState.roomId}
          players={gameState.players}
          myPlayerId={myPlayerId}
        />
      </>
    )
  }

    if (gameState.status === 'selecting') {
    return (
      <>
        <ThemeSwitcher />
        <CharacterSelectScreen
          roomId={gameState.roomId}
          players={gameState.players}
          myPlayerId={myPlayerId}
          isDebug={gameState.isDebug}
          onSelectCharacter={selectCharacter}
          onSetReady={setReady}
        />
      </>
    )
  }

  const worldHandOffset = {
    x: handDrag.x / 40,
    progress: handDrag.lift / MAX_HAND_OFFSET_Y
  }

  const myCharacter = getCharacter(
    gameState.players.find((p) => p.id === myPlayerId)?.character ?? 'rex'
  )
  const opponent = gameState.players.find((p) => p.id !== myPlayerId)
  const opponentCharacter = getCharacter(opponent?.character ?? 'rex')
  const opponentName = opponent?.name ?? 'Rex'

  return (
    <div
      className="flex h-screen relative"
      style={{ background: 'var(--color-base-300, var(--fun-dkgreen, #1B5C38))' }}
    >
      {gambleResult && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${gambleResult === 'good' ? 'alert-success' : 'alert-error'}`}>
            <span>
              {gambleResult === 'good'
                ? '🔥 GILA BANGET! dino ini emang goat ngocok dadu, gg no re!!'
                : '💀 anjir parah bat, dadu paling sampah sejagat. dino nya emang gabisa diandelin wkwk'}
            </span>
          </div>
        </div>
      )}

      {/* ── Score Panel (left sidebar) ── */}
      <ScorePanel
        players={gameState.players}
        dice={gameState.dice}
        myPlayerId={myPlayerId}
        rollsLeftInTurn={gameState.rollsLeftInTurn}
        currentTurn={gameState.currentTurn}
        onClaimScore={claimScore}
      />

      {/* ── 3D Game Scene ── */}
      <div ref={sceneContainerRef} className="flex-1 relative overflow-hidden">
        <GameScene
          dice={gameState.dice}
          isRolling={isRolling}
          isShaking={isShaking}
          onDiceClick={toggleHold}
          handOffset={worldHandOffset}
          opponentName={opponentName}
          opponentSprite={opponentCharacter.sprite}
        />

                        <img
          src={isShaking ? myCharacter.handClose : myCharacter.handOpen}
          onMouseDown={handleHandMouseDown}
          draggable={false}
          style={{
            transform: `translateX(calc(-50% + ${handDrag.x}px)) translateY(${-handDrag.lift}px)`
          }}
          className={`absolute -bottom-12 left-1/2 w-52 h-64 object-contain select-none z-10 pointer-events-auto ${
            gameState.rollsLeftInTurn <= 0 || isRolling ? 'opacity-40' : 'cursor-pointer'
          }`}
        />
      </div>
    </div>
  )
}

export default App
