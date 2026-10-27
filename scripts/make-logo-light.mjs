// Builds public/logo-light.svg — the light-theme variant of the logo where the
// white "Digital News" wordmark is recoloured to the site's dark ink so it
// stays visible on the white light theme.
//
// Only near-neutral light pixels in the wordmark region (right of the globe)
// are touched, so the globe, the red KENYA lettering and the red/green swoosh
// keep their colours. A feathered boundary avoids a hard edge where the region
// starts. Run after scripts/make-logo-svg.mjs (shares its source).
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const SRC = 'logo-alpha.png' // trimmed + background made transparent
const OUT_SVG = 'public/logo-light.svg'
const TARGET_W = 900
const INK = [16, 18, 20] // #101214 — the site's dark ink / light-theme text

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: C } = info

const X0 = W * 0.4 // wordmark starts to the right of the globe
const FEATHER = W * 0.05
let changed = 0

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C
    if (data[i + 3] === 0) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    if (spread > 80) continue // saturated: red KENYA, swoosh, blue globe
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    if (luma < 120) continue // already dark enough on white
    let t = Math.min(1, (luma - 120) / 135)
    t *= Math.min(1, Math.max(0, (x - X0) / FEATHER)) // feather region edge
    if (t === 0) continue
    data[i] = Math.round(r + (INK[0] - r) * t)
    data[i + 1] = Math.round(g + (INK[1] - g) * t)
    data[i + 2] = Math.round(b + (INK[2] - b) * t)
    changed++
  }
}

const resized = await sharp(data, { raw: { width: W, height: H, channels: C } })
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

console.log(`logo-light.svg: ${w}x${h}, ${(svg.length / 1024).toFixed(0)} KB, ${changed} px recoloured`)
