import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const root = document.getElementById('root')!
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Предрендер кладёт готовую разметку в #root. Если она есть — гидратируем,
// иначе монтируем с нуля (dev-сервер, прямой заход в vite).
if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
