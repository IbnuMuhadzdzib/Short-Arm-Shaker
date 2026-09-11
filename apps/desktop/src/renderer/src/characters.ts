import type { CharacterId } from '@yahtzee/shared'

import charRexUrl from './assets/char/char-rex.png'
import rexOpenUrl from './assets/hands/rex/rex-open.png'
import rexCloseUrl from './assets/hands/rex/rex-close.png'

import charTrixieUrl from './assets/char/char-trixie.jpg'
import trixieOpenUrl from './assets/hands/trixie/trixie-open.png'
import trixieCloseUrl from './assets/hands/trixie/trixie-close.png'

export interface CharacterDef {
  id: CharacterId
  label: string
  portrait: string
  sprite: string
  handOpen: string
  handClose: string
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'rex',
    label: 'Rex',
    portrait: charRexUrl,
    sprite: charRexUrl,
    handOpen: rexOpenUrl,
    handClose: rexCloseUrl
  },
  {
    id: 'trixie',
    label: 'Trixie',
    portrait: charTrixieUrl,
    sprite: charTrixieUrl,
    handOpen: trixieOpenUrl,
    handClose: trixieCloseUrl
  }
]

export function getCharacter(id: CharacterId): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]
}