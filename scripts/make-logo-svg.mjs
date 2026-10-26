// Builds public/logo.svg (and public/logo.png) from the transparent, trimmed
// logo so the background sits on the website's own colour instead of the
// original dark-blue rectangle.
// Run after scripts/logo-transparent.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const SRC = 'logo-alpha.png' // trimmed + background made transparent
const OUT_SVG = 'public/logo.svg'
const OUT_PNG = 'public/logo.png'
const TARGET_W = 900

const meta = await sharp(SRC).metadata()

const resized = await sharp(SRC)
  .resize({ width: TARGET_W })
  .png({ compressionLevel: 9 })
  .toBuffer({ resolveWithObject: true })

const w = resized.info.width
const h = resized.info.height
const b64 = resized.data.toString('base64')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Digital News Kenya">
  <title>Digital News Kenya</title>
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`

writeFileSync(OUT_SVG, svg)
// refresh logo.png (structured-data fallback) with the transparent brand image
await sharp(SRC).png({ compressionLevel: 9 }).toFile(OUT_PNG)

console.log(`logo.svg: ${w}x${h}, ${(svg.length / 1024).toFixed(0)} KB (src ${meta.width}x${meta.height}, transparent bg)`)
console.log(`logo.png: refreshed (transparent)`)
