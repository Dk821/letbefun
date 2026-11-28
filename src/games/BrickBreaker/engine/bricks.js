import { BRICK_GAP, BRICK_H, BRICK_TOP, BRICK_W, ROW_PITCH, SIDE } from '../data/constants.js'

export const BRICK_TYPES = {
  n: { type: 'normal', hp: 1, points: 50 },
  s: { type: 'strong', hp: 2, points: 120 },
  t: { type: 'strong', hp: 3, points: 180 },
  g: { type: 'gold', hp: 3, points: 500 },
  x: { type: 'explosive', hp: 1, points: 80 },
  p: { type: 'power', hp: 1, points: 60 },
  u: { type: 'steel', hp: Infinity, points: 0 },
}

// Normal bricks are coloured by row.
const ROW_COLORS = ['#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4']
const COLORS = { strong: '#8b5cf6', gold: '#fbbf24', explosive: '#f97316', power: '#10b981', steel: '#64748b' }

export function makeBrick(char, row, col, tone = row) {
  const spec = BRICK_TYPES[char]
  return {
    ...spec,
    maxHp: spec.hp,
    row,
    col,
    x: SIDE + col * (BRICK_W + BRICK_GAP),
    color: spec.type === 'normal' ? ROW_COLORS[tone % ROW_COLORS.length] : COLORS[spec.type],
    flash: 0,
    alive: true,
  }
}

/** Turns level text into bricks. `toughen` is the share of normal bricks made stronger (Hard). */
export function buildBricks(rows, toughen = 0) {
  const bricks = []
  let normals = 0
  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      let char = line[col]
      if (!BRICK_TYPES[char]) continue
      if (char === 'n') {
        // Spread evenly and the same way every time.
        if (Math.floor((normals + 1) * toughen) > Math.floor(normals * toughen)) char = 's'
        normals++
      }
      bricks.push(makeBrick(char, row, col))
    }
  })
  return bricks
}

export const brickY = (brick, slide = 0) => BRICK_TOP + brick.row * ROW_PITCH - slide
export const breakableCount = (bricks) => bricks.reduce((n, b) => n + (b.alive && b.type !== 'steel' ? 1 : 0), 0)

// ---- drawing ----
const SCALE = 2
const PAD = 6
const sprites = new Map()

function paintBrick(c, { type, color, hp, maxHp }) {
  const w = BRICK_W
  const h = BRICK_H
  c.shadowColor = color
  c.shadowBlur = type === 'steel' ? 0 : 8
  const body = c.createLinearGradient(0, 0, 0, h)
  body.addColorStop(0, type === 'steel' ? '#cbd5e1' : color)
  body.addColorStop(1, type === 'steel' ? '#334155' : `${color}99`)
  c.fillStyle = body
  c.beginPath()
  c.roundRect(0, 0, w, h, 5)
  c.fill()
  c.shadowBlur = 0
  c.strokeStyle = 'rgba(255,255,255,0.35)'
  c.lineWidth = 1
  c.stroke()
  c.fillStyle = 'rgba(255,255,255,0.35)'
  c.fillRect(4, 2.5, w - 8, 2)

  if (type === 'strong' || type === 'gold') {
    // One pip per hit still needed, plus cracks for damage taken.
    c.fillStyle = type === 'gold' ? '#78350f' : '#f5f3ff'
    for (let i = 0; i < hp; i++) c.fillRect(w / 2 - hp * 4 + i * 8 + 1, h / 2, 6, 4)
    const lost = maxHp - hp
    if (lost > 0) {
      c.strokeStyle = 'rgba(2,6,23,0.75)'
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(9, 0); c.lineTo(14, 8); c.lineTo(9, 12); c.lineTo(13, h)
      if (lost > 1) {
        c.moveTo(w - 10, 0); c.lineTo(w - 15, 7); c.lineTo(w - 7, 11); c.lineTo(w - 13, h)
        c.moveTo(14, 8); c.lineTo(22, 5)
      }
      c.stroke()
    }
  } else if (type === 'steel') {
    c.fillStyle = '#1e293b'
    for (const x of [6, w - 6]) {
      for (const y of [6, h - 6]) {
        c.beginPath()
        c.arc(x, y, 1.8, 0, Math.PI * 2)
        c.fill()
      }
    }
    c.strokeStyle = 'rgba(15,23,42,0.5)'
    c.lineWidth = 3
    c.beginPath()
    for (let x = 13; x < w - 16; x += 8) {
      c.moveTo(x, h - 4)
      c.lineTo(x + 6, 4)
    }
    c.stroke()
  } else if (type === 'explosive') {
    c.fillStyle = '#431407'
    c.beginPath()
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const r = i % 2 ? 3.5 : 8
      c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r)
    }
    c.fill()
  } else if (type === 'power') {
    c.fillStyle = '#ecfdf5'
    c.font = '900 15px Nunito, sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText('?', w / 2, h / 2 + 2)
  }
}

function brickSprite(brick) {
  const key = `${brick.type}:${brick.color}:${brick.hp}:${brick.maxHp}`
  let sprite = sprites.get(key)
  if (!sprite) {
    sprite = document.createElement('canvas')
    sprite.width = Math.ceil((BRICK_W + PAD * 2) * SCALE)
    sprite.height = (BRICK_H + PAD * 2) * SCALE
    const c = sprite.getContext('2d')
    c.scale(SCALE, SCALE)
    c.translate(PAD, PAD)
    paintBrick(c, brick)
    sprites.set(key, sprite)
  }
  return sprite
}

export function drawBricks(ctx, bricks, { slide, intro, clock }) {
  for (const brick of bricks) {
    if (!brick.alive) continue
    // New formations drop in row by row.
    const appear = Math.max(0, Math.min(1, intro * 3 - brick.row * 0.12))
    if (!appear) continue
    const y = brickY(brick, slide) - (1 - appear) * 18
    const bump = brick.flash * 3
    ctx.globalAlpha = appear
    ctx.drawImage(brickSprite(brick), brick.x - PAD - bump / 2, y - PAD - bump / 2, BRICK_W + PAD * 2 + bump, BRICK_H + PAD * 2 + bump)
    let shine = brick.flash * 0.7
    if (brick.type === 'explosive') shine = Math.max(shine, 0.16 + Math.sin(clock * 7 + brick.col) * 0.16)
    if (shine > 0) {
      ctx.globalAlpha = appear * shine
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(brick.x, y, BRICK_W, BRICK_H, 5)
      ctx.fill()
    }
    if (brick.type === 'gold') {
      // A glint that sweeps across golden bricks.
      const sweep = ((clock * 0.7 + brick.col * 0.09) % 1.6) * (BRICK_W + 20) - 10
      if (sweep > 0 && sweep < BRICK_W - 8) {
        ctx.globalAlpha = appear * 0.55
        ctx.fillStyle = '#fffbeb'
        ctx.fillRect(brick.x + sweep, y + 2, 6, BRICK_H - 4)
      }
    }
  }
  ctx.globalAlpha = 1
}
