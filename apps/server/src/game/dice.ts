import type { Dice, DiceValue } from '@yahtzee/shared'

const GAMBLE_THRESHOLD_MS = 10000
const GAMBLE_GOOD_CHANCE = 0.1

interface RollResult {
  dice: Dice[]
  gambleResult: 'none' | 'good' | 'bad'
}

export function rollDice(currentDice: Dice[], holdDurationMs: number): RollResult {
  const isGambling = holdDurationMs >= GAMBLE_THRESHOLD_MS

  let forcedValue: DiceValue | null = null
  let gambleResult: RollResult['gambleResult'] = 'none'

  if (isGambling) {
    const isGoodOutcome = Math.random() < GAMBLE_GOOD_CHANCE
    gambleResult = isGoodOutcome ? 'good' : 'bad'
    forcedValue = isGoodOutcome ? ((Math.random() < 0.5 ? 5 : 6) as DiceValue) : 1
  }

  const dice = currentDice.map((die) => {
    if (die.isHeld) return die
    const newValue = forcedValue ?? ((Math.floor(Math.random() * 6) + 1) as DiceValue)
    return { ...die, value: newValue }
  })

  return { dice, gambleResult }
}