import { useState } from 'react'
import { useSocket } from './hooks/useSocket'
import { JoinScreen } from './components/JoinScreen'
import { GameScene } from './scene/GameScene'

function App() {
    const { gameState, isConnected, joinRoom, rollDice } = useSocket()
  const [isRolling, setIsRolling] = useState(false)

  const handleRoll = () => {
    if (isRolling) return
    setIsRolling(true)
    rollDice()

    setTimeout(() => {
      setIsRolling(false)
    }, 1600)
  }

  if (!isConnected) {
    return <div className="status">Menghubungkan ke server...</div>
  }

  if (!gameState) {
    return <JoinScreen onJoin={joinRoom} />
  }

    return (
    <div className="flex h-screen bg-base-300">
      <div className="w-72 p-4 bg-base-200 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Room: {gameState.roomId}</h2>
        <div className="badge badge-outline">Sisa roll: {gameState.rollsLeftInTurn}</div>

        <button
          onClick={handleRoll}
          disabled={isRolling || gameState.rollsLeftInTurn <= 0}
          className="btn btn-primary"
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>

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

      <div className="flex-1">
        <GameScene dice={gameState.dice} isRolling={isRolling} />
      </div>
    </div>
  )
}

export default App