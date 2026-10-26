// Removes the dark-blue background from the trimmed logo via border flood-fill,
// leaving the globe, rings and text intact on a transparent canvas.
// Run: node scripts/logo-transparent.mjs  -> writes logo-alpha.png (for review)
import sharp from 'sharp'

const SRC = 'logo-src.png'
const OUT = 'logo-alpha.png'
const LOCAL = 15 // max per-pixel colour step allowed between adjacent bg pixels

const { data, info } = await sharp(SRC)
  .trim({ threshold: 30 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const W = info.width
const H = info.height
const C = info.channels
const out = Buffer.from(data)

const at = (x, y) => (y * W + x) * C
const step = (a, b) =>
  Math.abs(data[a] - data[b]) +
  Math.abs(data[a + 1] - data[b + 1]) +
  Math.abs(data[a + 2] - data[b + 2])

// Seed: every border pixel (all background), then expand inward only where the
// colour changes smoothly (the gradient background) — sharp edges (globe rim,
// rings, text) stop the fill.
const visited = new Uint8Array(W * H)
const queue = []
const tryPush = (x, y, from) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const p = y * W + x
  if (visited[p]) return
  if (from !== -1 && step(from, at(x, y)) > LOCAL) return
  visited[p] = 1
  queue.push(p * C)
}
for (let x = 0; x < W; x++) { tryPush(x, 0, -1); tryPush(x, H - 1, -1) }
for (let y = 0; y < H; y++) { tryPush(0, y, -1); tryPush(W - 1, y, -1) }

let head = 0
while (head < queue.length) {
  const i = queue[head++]
  const x = (i / C) % W
  const y = Math.floor(i / C / W)
  tryPush(x + 1, y, i)
  tryPush(x - 1, y, i)
  tryPush(x, y + 1, i)
  tryPush(x, y - 1, i)
}

// Never clear saturated red / green pixels (dashes, rings, Kenya marker) so the
// flood-fill can't erode them; clear everything else that was reached.
const protect = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  const red = r > 85 && r > g + 35 && r > b + 35
  const green = g > 65 && g > r + 25 && g > b + 25
  return red || green
}
let cleared = 0
for (let p = 0; p < W * H; p++) {
  const i = p * C
  if (visited[p] && !protect(i)) { out[i + 3] = 0; cleared++ }
}

await sharp(out, { raw: { width: W, height: H, channels: C } }).png().toFile(OUT)
console.log(`${OUT}: ${W}x${H}, cleared ${((cleared / (W * H)) * 100).toFixed(1)}% of pixels`)
