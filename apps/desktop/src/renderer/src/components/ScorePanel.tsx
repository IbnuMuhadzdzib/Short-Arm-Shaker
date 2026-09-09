import { useState } from 'react'
import type { Player, Dice, ScoreCategory } from '@yahtzee/shared'
import { calculateScore, upperSum, totalScore } from '../hooks/useScoring'
import './ScorePanel.css'

interface ScorePanelProps {
    players: Player[]
    dice: Dice[]
    myPlayerId: string
    rollsLeftInTurn: number
    currentTurn: number
    onClaimScore: (category: ScoreCategory) => void
}

const UPPER_ROWS: { label: string; category: ScoreCategory; hint: string }[] = [
    { label: 'Ones', category: 'ones', hint: '⚀' },
    { label: 'Twos', category: 'twos', hint: '⚁' },
    { label: 'Threes', category: 'threes', hint: '⚂' },
    { label: 'Fours', category: 'fours', hint: '⚃' },
    { label: 'Fives', category: 'fives', hint: '⚄' },
    { label: 'Sixes', category: 'sixes', hint: '⚅' },
]

const LOWER_ROWS: { label: string; category: ScoreCategory; fixed?: number }[] = [
    { label: '3 of a Kind', category: 'threeOfKind' },
    { label: '4 of a Kind', category: 'fourOfKind' },
    { label: 'Full House', category: 'fullHouse', fixed: 25 },
    { label: 'Sm. Straight', category: 'smallStraight', fixed: 30 },
    { label: 'Lg. Straight', category: 'largeStraight', fixed: 40 },
    { label: 'Chance', category: 'chance' },
    { label: '★ Yahtzee', category: 'yahtzee', fixed: 50 },
]

const TOTAL_TURNS = 13

export function ScorePanel({
    players,
    dice,
    myPlayerId,
    rollsLeftInTurn,
    currentTurn,
    onClaimScore,
}: ScorePanelProps) {
    const [hoveredCategory, setHoveredCategory] = useState<ScoreCategory | null>(null)

    const me = players.find((p) => p.id === myPlayerId)
    const isMyTurn = me?.isCurrentTurn ?? false
    const canClaim = isMyTurn && rollsLeftInTurn < 3

    function handleClaim(category: ScoreCategory) {
        if (!canClaim) return
        if (me?.scoreCard[category] !== undefined) return
        onClaimScore(category)
        setHoveredCategory(null)
    }

    function renderCell(player: Player, category: ScoreCategory) {
        const claimed = player.scoreCard[category]
        const isMe = player.id === myPlayerId
        const isHovered = isMe && hoveredCategory === category

        if (claimed !== undefined) {
            return (
                <td key={category} className="score-cell claimed">
                    <span className="score-value">{claimed}</span>
                </td>
            )
        }

        // Preview score for my turn
        const preview = (isMe && canClaim) ? calculateScore(category, dice) : null

        return (
            <td
                key={category}
                className={`score-cell ${isMe && canClaim ? 'claimable' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => isMe && canClaim && setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => isMe && handleClaim(category)}
            >
                {isHovered && preview !== null ? (
                    <span className="score-preview">{preview}</span>
                ) : null}
            </td>
        )
    }

    return (
        <div className="score-panel">
            {/* Turn header with roll count */}
            <div className="turn-header">
                <div className="turn-info">
                    <span className="turn-label">TURN</span>
                    <span className="turn-count">
                        {Math.min(currentTurn, TOTAL_TURNS)}
                        <span className="turn-total"> / {TOTAL_TURNS}</span>
                    </span>
                </div>

                <div className="rolls-remaining">
                    <span className="rolls-label">ROLL</span>
                    <div className="roll-dots">
                        {[1, 2, 3].map((n) => (
                            <span
                                key={n}
                                className={`roll-dot ${n <= rollsLeftInTurn ? 'dot-active' : 'dot-used'}`}
                            />
                        ))}
                    </div>
                    <span className="rolls-count">{rollsLeftInTurn}x</span>
                </div>
            </div>

            <table className="score-table">
                <thead>
                    <tr>
                        <th className="category-col"></th>
                        {players.map((p) => (
                            <th
                                key={p.id}
                                className={`player-col ${p.isCurrentTurn ? 'active-player' : ''}`}
                            >
                                <span className="player-name">{p.name}</span>
                                {p.isCurrentTurn && <span className="turn-dot" />}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {/* ── Upper section ── */}
                    <tr className="section-divider">
                        <td colSpan={1 + players.length} className="section-label">UPPER</td>
                    </tr>

                    {UPPER_ROWS.map(({ label, category, hint }) => (
                        <tr key={category} className={`score-row ${hoveredCategory === category ? 'row-hover' : ''}`}>
                            <td className="category-name">
                                <span className="dice-hint">{hint}</span>
                                {label}
                            </td>
                            {players.map((player) => renderCell(player, category))}
                        </tr>
                    ))}

                    {/* Sum + Bonus rows */}
                    <tr className="sum-row">
                        <td className="category-name dim">Sum</td>
                        {players.map((p) => {
                            const sum = upperSum(p.scoreCard)
                            return (
                                <td key={p.id} className="score-cell sum-cell">
                                    <span className={sum >= 63 ? 'bonus-reached' : ''}>{sum}</span>
                                    <span className="sum-target">/63</span>
                                </td>
                            )
                        })}
                    </tr>
                    <tr className="bonus-row">
                        <td className="category-name dim">+35 Bonus</td>
                        {players.map((p) => {
                            const sum = upperSum(p.scoreCard)
                            const earned = sum >= 63
                            return (
                                <td key={p.id} className={`score-cell ${earned ? 'bonus-earned' : ''}`}>
                                    {earned ? '+35' : `${Math.max(0, 63 - sum)} left`}
                                </td>
                            )
                        })}
                    </tr>

                    {/* ── Lower section ── */}
                    <tr className="section-divider">
                        <td colSpan={1 + players.length} className="section-label">LOWER</td>
                    </tr>

                    {LOWER_ROWS.map(({ label, category, fixed }) => (
                        <tr key={category} className={`score-row ${hoveredCategory === category ? 'row-hover' : ''}`}>
                            <td className="category-name">
                                {label}
                                {fixed !== undefined && <span className="fixed-pts"> ({fixed}pt)</span>}
                            </td>
                            {players.map((player) => renderCell(player, category))}
                        </tr>
                    ))}

                    {/* ── Total ── */}
                    <tr className="total-row">
                        <td className="category-name total-label">TOTAL</td>
                        {players.map((p) => (
                            <td key={p.id} className="score-cell total-cell">
                                {totalScore(p.scoreCard)}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>

            {/* Hint text */}
            <div className="panel-hint">
                {canClaim
                    ? 'Hover kategori → klik untuk klaim skor'
                    : isMyTurn
                        ? 'Kocok dadu dulu buat bisa klaim skor'
                        : 'Tunggu giliran kamu...'}
            </div>
        </div>
    )
}
