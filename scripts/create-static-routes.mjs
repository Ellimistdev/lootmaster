import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages serves directory index files, not Vite's SPA fallback.
// Reuse the built application shell so direct /data visits work.
mkdirSync(resolve('dist/data'), { recursive: true })
copyFileSync(resolve('dist/index.html'), resolve('dist/data/index.html'))
