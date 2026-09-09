import type { Player } from '@yahtzee/shared'
import './WaitingRoom.css'

interface WaitingRoomProps {
    roomId: string
    players: Player[]
    myPlayerId: string
}

export function WaitingRoom({ roomId, players, myPlayerId }: WaitingRoomProps) {
    return (
        <div className="waiting-root">
            {/* Ambient background noise */}
            <div className="waiting-bg-glow" />

            <div className="waiting-card">
                <div className="waiting-icon">🎲</div>

                <h1 className="waiting-title">Menunggu Pemain...</h1>

                <div className="waiting-room-id">
                    <span className="room-label">ROOM</span>
                    <span className="room-value">{roomId}</span>
                </div>

                <p className="waiting-sub">
                    Kasih tau temen kamu buat masuk ke room yang sama
                </p>

                {/* Player slots */}
                <div className="waiting-slots">
                    {[0, 1].map((slot) => {
                        const player = players[slot]
                        const isMe = player?.id === myPlayerId
                        return (
                            <div key={slot} className={`player-slot ${player ? 'filled' : 'empty'}`}>
                                {player ? (
                                    <>
                                        <span className="slot-icon">🎰</span>
                                        <span className="slot-name">
                                            {player.name}
                                            {isMe && <span className="slot-you"> (kamu)</span>}
                                        </span>
                                        <span className="slot-ready">✓</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="slot-icon empty-icon">?</span>
                                        <span className="slot-name empty-name">Menunggu pemain...</span>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="waiting-spinner">
                    <span /><span /><span />
                </div>
            </div>
        </div>
    )
}
