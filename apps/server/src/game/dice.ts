import type { Dice, DiceValue } from '@yahtzee/shared'

export function rollDice(currentDice: Dice[]): Dice[] {
  return currentDice.map((die) => {
    if (die.isHeld) {
      return die
    }
    const newValue = (Math.floor(Math.random() * 6) + 1) as DiceValue
    return { ...die, value: newValue }
  })
}