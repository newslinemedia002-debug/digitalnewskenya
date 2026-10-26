// Builds app/icon.svg (browser tab favicon) from the square logo:
// 1. flood-fills the dark-blue background to transparent,
// 2. keeps only the top content band (the globe + rings, dropping the text),
// 3. crops to the globe's bounding box and scales it to fill a square canvas,
//    so the tab shows a large world icon with no background and no text.
// Run: node scripts/make-favicon.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const SRC = 'favicon-src.png'
const OUT = 'app/icon.svg'
const SIZE = 256
const LOCAL = 15 // max colour step between adjacent background pixels

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width
const H = info.height
const C = info.channels

const at = (x, y) => (y * W + x) * C
const step = (a, b) =>
  Math.abs(data[a] - data[b]) +
  Math.abs(data[a + 1] - data[b + 1]) +
  Math.abs(data[a + 2] - data[b + 2])

// --- flood-fill the background from the borders (smooth-gradient only) ---
const vis = new Uint8Array(W * H)
const queue = []
const tryPush = (x, y, from) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const p = y * W + x
  if (vis[p]) return
  if (from !== -1 && step(from, at(x, y)) > LOCAL) return
  vis[p] = 1
  queue.push(p * C)
}
for (let x = 0; x < W; x++) { tryPush(x, 0, -1); tryPush(x, H - 1, -1) }
for (let y = 0; y < H; y++) { tryPush(0, y, -1); tryPush(W - 1, y, -1) }
let head = 0
while (head < queue.length) {
  const i = queue[head++]
  const x = (i / C) % W
  const y = Math.floor(i / C / W)
  tryPush(x + 1, y, i); tryPush(x - 1, y, i); tryPush(x, y + 1, i); tryPush(x, y - 1, i)
}

const out = Buffer.from(data)
for (let p = 0; p < W * H; p++) if (vis[p]) out[p * C + 3] = 0

// --- find the first content band (the globe) ---
const rowHas = []
for (let y = 0; y < H; y++) {
  let c = 0
  for (let x = 0; x < W; x++) if (!vis[y * W + x]) c++
  rowHas.push(c > 3)
}
let y0 = -1, y1 = -1
for (let y = 0; y < H; y++) {
  if (rowHas[y] && y0 < 0) y0 = y
  if (y0 >= 0 && (!rowHas[y] || y === H - 1)) { y1 = y; break }
}
// x bounds inside that band
let x0 = W, x1 = 0
for (let y = y0; y <= y1; y++)
  for (let x = 0; x < W; x++)
    if (!vis[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x }

const bw = x1 - x0 + 1
const bh = y1 - y0 + 1

// --- crop globe, fit to width, pad to a square (keeps ring tips intact) ---
const gw = SIZE
const gh = Math.round((SIZE * bh) / bw)
const cropped = await sharp(out, { raw: { width: W, height: H, channels: C } })
  .extract({ left: x0, top: y0, width: bw, height: bh })
  .resize(gw, gh)
  .png()
  .toBuffer()

const padded = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: cropped, left: 0, top: Math.round((SIZE - gh) / 2) }])
  .png()
  .toBuffer()

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <image width="${SIZE}" height="${SIZE}" xlink:href="data:image/png;base64,${padded.toString('base64')}"/>
</svg>
`
writeFileSync(OUT, svg)
console.log(`app/icon.svg: globe band y=${y0}-${y1} x=${x0}-${x1} (${bw}x${bh}), scaled to ${gw}x${gh} in ${SIZE}x${SIZE}, ${(svg.length / 1024).toFixed(0)} KB`)
