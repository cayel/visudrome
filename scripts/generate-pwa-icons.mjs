import { readFileSync } from 'node:fs'
import sharp from 'sharp'

const svg = readFileSync(new URL('../public/app-icon.svg', import.meta.url))

const targets = [
  ['public/pwa-192x192.png', 192],
  ['public/pwa-512x512.png', 512],
  ['public/apple-touch-icon.png', 180],
]

for (const [file, size] of targets) {
  await sharp(svg).resize(size, size).png().toFile(new URL(`../${file}`, import.meta.url))
  console.log(`Generated ${file}`)
}
