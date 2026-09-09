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
    <div className="game-screen">
      <div className="hud">
        <h2>Room: {gameState.roomId}</h2>
        <p>Sisa roll: {gameState.rollsLeftInTurn}</p>
        <button onClick={handleRoll} disabled={isRolling || gameState.rollsLeftInTurn <= 0}>
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
        <ul>
          {gameState.players.map((player) => (
            <li key={player.id}>
              {player.name} {player.isCurrentTurn ? '(giliran)' : ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="scene-container">
        <GameScene dice={gameState.dice} isRolling={isRolling} />
      </div>
    </div>
  )
}

export default App