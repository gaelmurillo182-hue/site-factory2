import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Шрифты самохостятся: приложение должно работать без сети.
import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/500.css'
import '@fontsource/golos-text/600.css'
import '@fontsource/unbounded/600.css'

import './styles/app.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Нет элемента #root — проверьте index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
