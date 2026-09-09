import { useEffect, useState } from 'react'
import './ThemeSwitcher.css'

type Theme = 'skyblue' | 'fun'

const THEMES: { id: Theme; label: string; emoji: string; preview: [string, string] }[] = [
    {
        id: 'skyblue',
        label: 'Sky Blue',
        emoji: '🩵',
        preview: ['#e1f2fe', '#98d2eb']
    },
    {
        id: 'fun',
        label: 'Fun',
        emoji: '🎲',
        preview: ['#FFE500', '#1B5C38']
    }
]

const STORAGE_KEY = 'yahtzee-theme'
const DEFAULT_THEME: Theme = 'skyblue'

function getSavedTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    return saved && THEMES.find((t) => t.id === saved) ? saved : DEFAULT_THEME
}

/** Apply theme to <html data-theme="..."> — must call before first render */
export function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
}

/** Init on app load — reads saved preference (or default) */
export function initTheme() {
    applyTheme(getSavedTheme())
}

/** Floating theme switcher pill — rendered inside App */
export function ThemeSwitcher() {
    const [current, setCurrent] = useState<Theme>(getSavedTheme)

    useEffect(() => {
        applyTheme(current)
    }, [current])

    return (
        <div className="theme-switcher">
            {THEMES.map((t) => (
                <button
                    key={t.id}
                    title={t.label}
                    onClick={() => setCurrent(t.id)}
                    className={`theme-btn ${current === t.id ? 'active' : ''}`}
                >
                    {/* Mini color swatch */}
                    <span
                        className="swatch"
                        style={{
                            background: `linear-gradient(135deg, ${t.preview[0]} 50%, ${t.preview[1]} 50%)`
                        }}
                    />
                    <span className="theme-emoji">{t.emoji}</span>
                    <span className="theme-label">{t.label}</span>
                </button>
            ))}
        </div>
    )
}
