export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Dice {
  id: string;
  value: DiceValue;
  isHeld: boolean;
}

export type ScoreCategory =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeOfKind' | 'fourOfKind' | 'fullHouse'
  | 'smallStraight' | 'largeStraight' | 'yahtzee' | 'chance'

export type ScoreCard = Partial<Record<ScoreCategory, number>>

export interface Player {
  id: string
  name: string
  scoreCard: ScoreCard
  isCurrentTurn: boolean
}

export interface GameState {
  roomId: string
  players: Player[]
  dice: Dice[]
  rollsLeftInTurn: number
  currentTurn: number
  status: 'waiting' | 'playing' | 'finished'
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void
  playerJoined: (player: Player) => void
  errorMessage: (message: string) => void
  gambleResult: (result: 'good' | 'bad') => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string, playerName: string) => void
  rollDice: (holdDurationMs: number) => void
  toggleHold: (diceId: string) => void
  claimScore: (category: ScoreCategory) => void
}
