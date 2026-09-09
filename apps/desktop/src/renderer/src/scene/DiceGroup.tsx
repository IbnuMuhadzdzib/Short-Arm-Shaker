import type { Dice } from '@yahtzee/shared'
import { SingleDice } from './SingleDice'

interface DiceGroupProps {
  dice: Dice[]
  isRolling: boolean
  isShaking: boolean
  onDiceClick: (diceId: string) => void
  handOffset: { x: number; progress: number }
}

export function DiceGroup({ dice, isRolling, isShaking, onDiceClick, handOffset }: DiceGroupProps) {
  return (
    <>
      {dice.map((die, index) => (
        <SingleDice
          key={die.id}
          value={die.value}
          isHeld={die.isHeld}
          isRolling={isRolling}
          isShaking={isShaking}
          startPosition={[index * 1.5 - 3, 3, 0]}
          onClick={() => onDiceClick(die.id)}
          handOffset={handOffset}
        />
      ))}
    </>
  )
}