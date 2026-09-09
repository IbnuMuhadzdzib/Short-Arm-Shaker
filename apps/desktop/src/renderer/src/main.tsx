import './assets/main.css'
import './assets/base.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initTheme } from './components/ThemeSwitcher'

// Apply saved theme (or default: skyblue) BEFORE first render
// so there's no flash of wrong theme
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
