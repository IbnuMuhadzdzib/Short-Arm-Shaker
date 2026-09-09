import type { Dice, ScoreCategory } from '@yahtzee/shared'

function counts(dice: Dice[]): Record<number, number> {
    const c: Record<number, number> = {}
    for (const d of dice) c[d.value] = (c[d.value] ?? 0) + 1
    return c
}

function sumAll(dice: Dice[]): number {
    return dice.reduce((s, d) => s + d.value, 0)
}

export function calculateScore(category: ScoreCategory, dice: Dice[]): number {
    const c = counts(dice)
    const vals = dice.map((d) => d.value)

    switch (category) {
        case 'ones': return (c[1] ?? 0) * 1
        case 'twos': return (c[2] ?? 0) * 2
        case 'threes': return (c[3] ?? 0) * 3
        case 'fours': return (c[4] ?? 0) * 4
        case 'fives': return (c[5] ?? 0) * 5
        case 'sixes': return (c[6] ?? 0) * 6

        case 'threeOfKind':
            return Object.values(c).some((n) => n >= 3) ? sumAll(dice) : 0
        case 'fourOfKind':
            return Object.values(c).some((n) => n >= 4) ? sumAll(dice) : 0
        case 'fullHouse': {
            const cv = Object.values(c)
            return cv.includes(3) && cv.includes(2) ? 25 : 0
        }
        case 'smallStraight': {
            const unique = [...new Set(vals)].sort()
            const str = unique.join('')
            return str.includes('1234') || str.includes('2345') || str.includes('3456') ? 30 : 0
        }
        case 'largeStraight': {
            const unique = [...new Set(vals)].sort()
            const str = unique.join('')
            return str === '12345' || str === '23456' ? 40 : 0
        }
        case 'yahtzee':
            return Object.values(c).some((n) => n === 5) ? 50 : 0
        case 'chance':
            return sumAll(dice)
        default:
            return 0
    }
}

export function upperSum(scoreCard: Partial<Record<ScoreCategory, number>>): number {
    const upper: ScoreCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
    return upper.reduce((s, cat) => s + (scoreCard[cat] ?? 0), 0)
}

export function totalScore(scoreCard: Partial<Record<ScoreCategory, number>>): number {
    const upper = upperSum(scoreCard)
    const bonus = upper >= 63 ? 35 : 0
    const lower: ScoreCategory[] = [
        'threeOfKind', 'fourOfKind', 'fullHouse',
        'smallStraight', 'largeStraight', 'yahtzee', 'chance'
    ]
    const lowerTotal = lower.reduce((s, cat) => s + (scoreCard[cat] ?? 0), 0)
    return upper + bonus + lowerTotal
}
