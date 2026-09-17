import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { routes } from './src/data/routes'

/**
 * После сборки кладём рядом с dist список маршрутов.
 * Предрендер и генератор sitemap читают именно его, поэтому список физически
 * не может разойтись с тем, что знает приложение.
 */
function routesManifest(): Plugin {
  return {
    name: 'lavitek-routes-manifest',
    apply: 'build',
    async writeBundle(_options, bundle) {
      await mkdir(resolve(__dirname, 'dist'), { recursive: true })
      await writeFile(resolve(__dirname, 'dist/routes.json'), JSON.stringify(routes, null, 2), 'utf8')

      // Чистый шаблон страницы откладываем отдельно: предрендер переписывает
      // dist/index.html, и без копии повторный запуск работал бы поверх уже
      // отрендеренной главной. Кладём рядом с проектом, а не в dist-ssr:
      // сборка серверного бандла очищает эту папку. Берём разметку из бандла —
      // на диске её
      // в этот момент может ещё не быть.
      const asset = bundle['index.html']
      if (!asset || asset.type !== 'asset') return
      await mkdir(resolve(__dirname, '.prerender'), { recursive: true })
      await writeFile(
        resolve(__dirname, '.prerender/index.template.html'),
        String(asset.source),
        'utf8',
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), routesManifest()],
  server: { host: '127.0.0.1', port: 5178, strictPort: true },
  preview: { host: '127.0.0.1', port: 4178, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        // Тяжёлое — отдельными чанками: 3D грузится лениво и не тянет первый экран.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
        },
      },
    },
  },
})
