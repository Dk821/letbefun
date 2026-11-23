// A stylized, procedurally generated planet ("Terra"). Not real Earth geography.
const hash = (x, y, z) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const lerp = (a, b, t) => a + (b - a) * t
const fade = (t) => t * t * (3 - 2 * t)

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi)
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz)
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  )
}

export function elevation(latDeg, lonDeg) {
  const la = (latDeg * Math.PI) / 180
  const lo = (lonDeg * Math.PI) / 180
  const x = Math.cos(la) * Math.cos(lo), y = Math.sin(la), z = Math.cos(la) * Math.sin(lo)
  let amp = 1, f = 1.6, sum = 0, norm = 0
  for (let i = 0; i < 4; i++) {
    sum += amp * noise3(x * f + 11, y * f + 7, z * f + 3)
    norm += amp
    amp *= 0.5
    f *= 2.1
  }
  return sum / norm
}
export const SEA_LEVEL = 0.5
export const isLand = (lat, lon) => elevation(lat, lon) > SEA_LEVEL

export function drawTexture(canvas, dark = false) {
  const W = canvas.width, H = canvas.height
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  for (let py = 0; py < H; py++) {
    const lat = 90 - ((py + 0.5) / H) * 180
    for (let px = 0; px < W; px++) {
      const lon = ((px + 0.5) / W) * 360 - 180
      const e = elevation(lat, lon)
      let r, g, b
      if (Math.abs(lat) > 72 + (e - 0.5) * 20) [r, g, b] = [236, 244, 250]
      else if (e <= SEA_LEVEL) {
        const t = Math.max(0, 1 - (SEA_LEVEL - e) * 6)
        r = lerp(16, 60, t); g = lerp(60, 150, t); b = lerp(120, 205, t)
      } else {
        const t = Math.min(1, (e - SEA_LEVEL) * 5)
        r = lerp(112, 150, t); g = lerp(160, 125, t); b = lerp(80, 90, t)
        if (e > 0.7) [r, g, b] = [225, 225, 225]
      }
      const i = (py * W + px) * 4
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  if (dark) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fillRect(0, 0, W, H)
  }
  return canvas
}

export const PLANET_RADIUS_KM = 6371
