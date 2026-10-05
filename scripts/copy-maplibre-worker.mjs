// Copy MapLibre's ESM worker (+ shared chunk) into public/ so the browser can load it as a module worker.
// Turbopack does not resolve MapLibre's internal `new URL('./worker', import.meta.url)`.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'maplibre-gl', 'dist')
const out = join(root, 'public', 'maplibre')
mkdirSync(out, { recursive: true })
for (const f of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) copyFileSync(join(src, f), join(out, f))
const { version } = JSON.parse(readFileSync(join(root, 'node_modules', 'maplibre-gl', 'package.json'), 'utf8'))
console.log(`maplibre-gl ${version} worker copied to public/maplibre/`)
