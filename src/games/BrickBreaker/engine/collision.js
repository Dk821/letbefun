/** Circle against an axis-aligned rectangle. Returns the outward normal and overlap depth, or null. */
export function circleRect(cx, cy, r, x, y, w, h) {
  const px = Math.max(x, Math.min(cx, x + w))
  const py = Math.max(y, Math.min(cy, y + h))
  const dx = cx - px
  const dy = cy - py
  const d2 = dx * dx + dy * dy
  if (d2 > r * r) return null
  if (d2 > 1e-6) {
    const d = Math.sqrt(d2)
    return { nx: dx / d, ny: dy / d, depth: r - d }
  }
  // Centre is inside the rectangle: leave through the nearest side.
  const [dist, nx, ny] = [
    [cx - x, -1, 0],
    [x + w - cx, 1, 0],
    [cy - y, 0, -1],
    [y + h - cy, 0, 1],
  ].sort((a, b) => a[0] - b[0])[0]
  return { nx, ny, depth: r + dist }
}

export const rectsOverlap = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
