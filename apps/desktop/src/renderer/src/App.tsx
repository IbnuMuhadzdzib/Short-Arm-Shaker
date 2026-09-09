import { useState, useRef, useEffect } from 'react'
import { useSocket } from './hooks/useSocket'
import { JoinScreen } from './components/JoinScreen'
import { GameScene } from './scene/GameScene'
import { useGameSounds } from './hooks/useDiceSounds'

const MAX_HAND_OFFSET_X = 60
const MAX_HAND_OFFSET_Y = 280
const RELEASE_THRESHOLD = 0.65
const GAMBLE_THRESHOLD_MS = 5000

function App() {
  const { gameState, isConnected, joinRoom, rollDice, toggleHold, gambleResult, clearGambleResult } =
    useSocket()
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
    return <div className="status">Menghubungkan ke server...</div>
  }

  if (!gameState) {
    return <JoinScreen onJoin={joinRoom} />
  }

  const worldHandOffset = {
    x: handDrag.x / 40,
    progress: handDrag.lift / MAX_HAND_OFFSET_Y
  }

  return (
    <div className="flex h-screen bg-base-300 relative">
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

      <div className="w-72 p-4 bg-base-200 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Room: {gameState.roomId}</h2>
        <div className="badge badge-outline">Sisa roll: {gameState.rollsLeftInTurn}</div>

        <p className="text-xs text-center opacity-70">
          {isShaking
            ? 'tahan & geser, lepas mouse di atas papan buat lempar'
            : 'tekan & tahan tangan dino di bawah, lepas di atas papan'}
        </p>

        <ul className="menu bg-base-100 rounded-box">
          {gameState.players.map((player) => (
            <li key={player.id}>
              <span className={player.isCurrentTurn ? 'font-bold text-primary' : ''}>
                {player.name} {player.isCurrentTurn ? '(giliran)' : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div ref={sceneContainerRef} className="flex-1 relative overflow-hidden">
        <GameScene
          dice={gameState.dice}
          isRolling={isRolling}
          isShaking={isShaking}
          onDiceClick={toggleHold}
          handOffset={worldHandOffset}
        />

        <div
          onMouseDown={handleHandMouseDown}
          style={{
            transform: `translateX(calc(-50% + ${handDrag.x}px)) translateY(${-handDrag.lift}px)`
          }}
          className={`absolute -bottom-5 left-1/2 text-8xl select-none z-10 ${
            gameState.rollsLeftInTurn <= 0 || isRolling ? 'opacity-40' : 'cursor-pointer'
          }`}
        >
          {isShaking ? '✊' : '🖐️'}
        </div>
      </div>
    </div>
  )
}

export default App