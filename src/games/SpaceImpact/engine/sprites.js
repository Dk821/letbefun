// Procedural graphics are rendered once into small offscreen canvases (glow included),
// so the game loop only needs cheap drawImage calls.
const cache = new Map()
const SS = 2 // supersampling for crisp sprites

export function offscreen(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.ceil(w)
  c.height = Math.ceil(h)
  return c
}

/** Draws a cached sprite centred on (x, y). `paint` draws around the origin. */
export function sprite(ctx, key, w, h, paint, x, y) {
  let c = cache.get(key)
  if (!c) {
    c = offscreen(w * SS, h * SS)
    const g = c.getContext('2d')
    g.scale(SS, SS)
    g.translate(w / 2, h / 2)
    paint(g)
    cache.set(key, c)
  }
  ctx.drawImage(c, x - w / 2, y - h / 2, w, h)
}

/** Soft radial glow. Colors must be #rrggbb. */
export function glow(ctx, color, x, y, radius) {
  const key = `glow:${color}`
  let c = cache.get(key)
  if (!c) {
    c = offscreen(64, 64)
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.25, color)
    grad.addColorStop(1, `${color}00`)
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    cache.set(key, c)
  }
  ctx.drawImage(c, x - radius, y - radius, radius * 2, radius * 2)
}

export function polygon(g, points, fill, stroke) {
  g.beginPath()
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
  g.closePath()
  if (fill) {
    g.fillStyle = fill
    g.fill()
  }
  if (stroke) {
    g.strokeStyle = stroke
    g.lineWidth = 1.6
    g.stroke()
  }
}

/** A hull with a neon outline. */
export function hull(g, points, top, bottom, edge, blur = 10) {
  const ys = points.map((p) => p[1])
  const grad = g.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys))
  grad.addColorStop(0, top)
  grad.addColorStop(1, bottom)
  g.shadowColor = edge
  g.shadowBlur = blur
  polygon(g, points, grad, edge)
  g.shadowBlur = 0
}

export function dot(g, x, y, r, color, blur = 8) {
  g.shadowColor = color
  g.shadowBlur = blur
  g.fillStyle = color
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
  g.fill()
  g.shadowBlur = 0
}
