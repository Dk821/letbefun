export function circlesHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx
  const dy = ay - by
  const r = ar + br
  return dx * dx + dy * dy <= r * r
}

/** Does a circle moving from (x1,y1) to (x2,y2) touch a circle? Stops fast shots tunnelling. */
export function sweptHit(x1, y1, x2, y2, r, cx, cy, cr) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len)) : 0
  return circlesHit(x1 + dx * t, y1 + dy * t, r, cx, cy, cr)
}

export function circleRectHit(cx, cy, r, x, y, w, h) {
  const nx = Math.max(x, Math.min(cx, x + w))
  const ny = Math.max(y, Math.min(cy, y + h))
  return (cx - nx) ** 2 + (cy - ny) ** 2 <= r * r
}
