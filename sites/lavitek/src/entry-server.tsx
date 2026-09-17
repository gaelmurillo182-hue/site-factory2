import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

/**
 * Серверный рендер для предрендера в статику.
 *
 * Снимать готовый DOM браузером нельзя: к моменту снимка уже отработали
 * эффекты (плашка cookie, появление блоков при прокрутке), и разметка
 * перестаёт совпадать с первым клиентским рендером — гидратация ломается,
 * React выбрасывает всё и рисует страницу заново.
 */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
