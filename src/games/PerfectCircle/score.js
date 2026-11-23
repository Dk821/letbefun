/** Score a hand-drawn stroke as a circle. Returns { score 0-100, ideal } or { error }. */
export function scoreCircle(points, centerHint) {
  if (points.length < 20) return { error: 'Too short — draw a bigger circle.' }
  const n = points.length
  const cx = points.reduce((s, p) => s + p.x, 0) / n
  const cy = points.reduce((s, p) => s + p.y, 0) / n
  const radii = points.map((p) => Math.hypot(p.x - cx, p.y - cy))
  const r = radii.reduce((a, b) => a + b, 0) / n
  if (r < 30) return { error: 'Too small — draw a bigger circle.' }

  // angular coverage: split into 36 buckets and require most to be hit
  const buckets = new Set(points.map((p) => Math.floor(((Math.atan2(p.y - cy, p.x - cx) + Math.PI) / (Math.PI * 2)) * 36) % 36))
  if (buckets.size < 32) return { error: 'That is not a full circle — go all the way around.' }

  // closure: how far the end is from the start relative to radius
  const gap = Math.hypot(points[0].x - points[n - 1].x, points[0].y - points[n - 1].y)
  const closePenalty = Math.min(12, (gap / r) * 30)

  const variance = radii.reduce((s, x) => s + (x - r) ** 2, 0) / n
  const roundness = Math.sqrt(variance) / r // coefficient of variation
  // centering relative to the dot (small bonus penalty)
  const offCenter = centerHint ? Math.min(6, (Math.hypot(cx - centerHint, cy - centerHint) / r) * 12) : 0

  const score = Math.max(0, Math.min(100, 100 - roundness * 220 - closePenalty - offCenter))
  return { score, ideal: { cx, cy, r } }
}
