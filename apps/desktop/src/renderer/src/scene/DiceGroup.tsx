import type { Dice } from '@yahtzee/shared'
import { SingleDice } from './SingleDice'

interface DiceGroupProps {
  dice: Dice[]
  isRolling: boolean
}

export function DiceGroup({ dice, isRolling }: DiceGroupProps) {
  return (
    <>
      {dice.map((die, index) => (
        <SingleDice
          key={die.id}
          value={die.value}
          isHeld={die.isHeld}
          isRolling={isRolling}
          startPosition={[index * 1.5 - 3, 3, 0]}
        />
      ))}
    </>
  )
}