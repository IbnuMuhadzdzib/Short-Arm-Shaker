import { CHARACTERS } from '../characters'
import type { CharacterId } from '@yahtzee/shared'

interface CharacterSelectProps {
  selected: CharacterId
  onSelect: (id: CharacterId) => void
}

export function CharacterSelect({ selected, onSelect }: CharacterSelectProps) {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {CHARACTERS.map((char) => (
        <button
          key={char.id}
          type="button"
          onClick={() => onSelect(char.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${
            selected === char.id
              ? 'border-primary bg-primary/20 scale-105'
              : 'border-transparent bg-base-200 opacity-70 hover:opacity-100'
          }`}
        >
          <img src={char.portrait} className="w-16 h-16 object-contain" draggable={false} />
          <span className="text-xs font-bold">{char.label}</span>
        </button>
      ))}
    </div>
  )
}