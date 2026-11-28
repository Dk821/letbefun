// Framework-free game simulation. update() has no DOM access, so it can run outside a browser.
import {
  BRICK_H, BRICK_TOP, BRICK_W, COMBO_WINDOW, DANGER_Y, DIFFICULTIES, LASER_COOLDOWN, MAX_BALLS, MAX_DT, MAX_LIVES,
  MODES, ROW_PITCH, SHIELD_Y, SUBSTEP, TIME_LIMIT, WORLD_H, WORLD_W,
} from '../data/constants.js'
import { LEVELS, generateFormation, generateRow } from '../data/levels.js'
import { POWERUPS, pickPowerup } from '../data/powerupTypes.js'
import { createBall, drawBalls, recordTrail } from './ball.js'
import { BRICK_TYPES, breakableCount, brickY, buildBricks, drawBricks, makeBrick } from './bricks.js'
import { circleRect } from './collision.js'
import { createBolts, createPaddle, drawBolts, drawPaddle, moveBolt, updatePaddle } from './paddle.js'
import { createBackground, createParticles, drawShield } from './particles.js'
import { aimFromPaddle, ballSpeed, bounceWalls, clamp, reflect, steady } from './physics.js'
import { createPickup, drawPickups, updatePickups } from './powerups.js'

export const createInput = () => ({ left: false, right: false, targetX: null, nudge: 0, launch: false, fireKey: false, fireTouch: false, fireButton: false })

const TIMED = ['expand', 'shrink', 'laser', 'slow', 'fire']
const noEffects = () => ({ expand: 0, shrink: 0, laser: 0, slow: 0, fire: 0, shield: false })
const CLEAR_SECONDS = 1.6
const AUTO_LAUNCH = 1.5 // Time Attack only: the clock keeps running, so the ball does not wait

export function createEngine({ onSound = () => {}, onEvent = () => {}, reducedMotion = false, random = Math.random } = {}) {
  const input = createInput()
  const particles = createParticles(reducedMotion ? 0.35 : 1)
  const background = createBackground(reducedMotion)
  const g = { status: 'idle', mode: 'classic', difficulty: 'normal', clock: 0, bricks: [] }
  let progress = { bricks: 0, powerups: 0, time: 0 } // not yet saved to storage
  let snapshot = null // run state at the start of the current level

  const shake = (amount) => {
    if (!reducedMotion) g.shake = Math.max(g.shake, amount)
  }
  const speed = () => ballSpeed({ base: g.diff.ball, level: g.mode === 'timeAttack' ? 3 : g.level, paddleHits: g.paddleHits, slow: g.effects.slow > 0 })
  const multiplier = () => Math.min(MODES[g.mode].maxMultiplier, 1 + Math.floor(g.combo / MODES[g.mode].comboStep))
  const pushInterval = () => Math.max(9, 22 - g.level * 1.4) * (g.difficulty === 'easy' ? 1.3 : g.difficulty === 'hard' ? 0.8 : 1)
  const announce = (title, subtitle = '') => {
    g.banner = { title, subtitle, t: 0 }
  }
  const takeSnapshot = () => {
    snapshot = { score: g.score, lives: g.lives, cleared: g.cleared, bricksDestroyed: g.bricksDestroyed, timeLeft: g.timeLeft, level: g.level, started: g.started }
  }

  /** Puts a fresh ball on the paddle. */
  function serve() {
    g.balls.push(createBall(g.paddle.x, g.paddle.y, 0, -1, true))
    g.waiting = 0
  }

  function loadFormation() {
    const rows = g.mode === 'endless' ? generateFormation(g.level, random) : LEVELS[(g.level - 1) % LEVELS.length].rows
    g.bricks = buildBricks(rows, g.diff.toughen)
    g.total = breakableCount(g.bricks)
    g.rowsMade = rows.length
    g.pushTimer = pushInterval()
    g.intro = 0
    g.slide = 0
    g.blasts = []
  }

  function beginLevel() {
    Object.assign(g, {
      paddle: createPaddle(g.diff.paddle),
      balls: [], pickups: [], bolts: [], effects: noEffects(),
      combo: 0, comboTimer: 0, cooldown: 0, paddleHits: 0, stall: 0, shake: 0,
      endTimer: 0, waiting: 0, victory: false, status: 'play',
      levelTime: 0, levelScore: 0, levelBricks: 0,
    })
    particles.clear()
    serve()
    loadFormation()
    takeSnapshot()
    if (g.mode === 'classic') announce(`LEVEL ${g.level}`, LEVELS[g.level - 1].name)
    else if (g.mode === 'endless') announce(`WAVE ${g.level}`, 'Stop the wall')
    else announce('TIME ATTACK', '120 seconds')
  }

  function start(mode, difficulty) {
    g.mode = mode
    g.difficulty = difficulty
    g.diff = DIFFICULTIES[difficulty]
    Object.assign(g, { score: 0, lives: g.diff.lives, level: 1, cleared: 0, bricksDestroyed: 0, playTime: 0, timeLeft: TIME_LIMIT, started: false })
    Object.assign(input, createInput())
    beginLevel()
  }

  function nextLevel() {
    if (g.status !== 'complete') return
    g.level++
    Object.assign(input, createInput())
    beginLevel()
  }

  /** Rewinds to how things were when this level (or wave) started. */
  function replayLevel() {
    if (!snapshot) return
    Object.assign(g, snapshot)
    Object.assign(input, createInput())
    beginLevel()
  }

  function stop() {
    g.status = 'idle'
    particles.clear()
  }

  function addScore(base) {
    const points = Math.round(base * g.diff.score * multiplier())
    g.score += points
    g.levelScore += points
    return points
  }

  function drop(type, x, y) {
    if (g.pickups.length < 6) g.pickups.push(createPickup(type, x, y))
  }

  /** Applies damage to a brick and handles its destruction. */
  function hitBrick(brick, damage = 1) {
    if (!brick.alive) return
    brick.flash = 1
    const x = brick.x + BRICK_W / 2
    const y = brickY(brick, g.slide) + BRICK_H / 2
    if (brick.type === 'steel') {
      particles.burst(x, y, '#cbd5e1', 3, 90)
      onSound('brick')
      return
    }
    g.stall = 0
    brick.hp -= damage
    if (brick.hp > 0) {
      addScore(10)
      particles.burst(x, y, brick.color, 4, 100)
      onSound('brick')
      return
    }
    brick.alive = false
    g.combo++
    g.comboTimer = COMBO_WINDOW
    g.bricksDestroyed++
    g.levelBricks++
    progress.bricks++
    const points = addScore(brick.points)
    const gold = brick.type === 'gold'
    particles.burst(x, y, brick.color, gold ? 18 : 10)
    particles.text(x, y, `+${points}`, gold ? '#fde68a' : '#e0f2fe', gold ? 18 : 13)
    onSound('break')
    if (brick.type === 'explosive') g.blasts.push({ row: brick.row, col: brick.col, t: 0.07 })
    if (brick.type === 'power' || random() < g.diff.drop) drop(pickPowerup(random, g.mode !== 'timeAttack'), x, y)
  }

  /** Explosions go off a moment apart, so chains are visible. */
  function updateBlasts(dt) {
    for (const blast of g.blasts) blast.t -= dt
    const ready = g.blasts.filter((b) => b.t <= 0)
    if (!ready.length) return
    g.blasts = g.blasts.filter((b) => b.t > 0)
    for (const { row, col } of ready) {
      const x = makeBrick('n', row, col).x + BRICK_W / 2
      const y = brickY({ row }, g.slide) + BRICK_H / 2
      particles.burst(x, y, '#fdba74', 22, 260)
      particles.ring(x, y, '#fb923c', 80)
      shake(0.22)
      onSound('explode')
      for (const other of g.bricks) {
        if (other.alive && other.type !== 'steel' && Math.abs(other.row - row) <= 1 && Math.abs(other.col - col) <= 1) hitBrick(other, 2)
      }
    }
  }

  function launch(ball) {
    ball.stuck = false
    ball.dx = (random() - 0.5) * 0.7
    ball.dy = -1
    steady(ball)
    g.started = true
    onSound('launch')
  }

  function splitBalls() {
    for (const ball of [...g.balls]) {
      if (ball.stuck) launch(ball)
      for (const turn of [-0.42, 0.42]) {
        if (g.balls.length >= MAX_BALLS) return
        const cos = Math.cos(turn)
        const sin = Math.sin(turn)
        const copy = createBall(ball.x, ball.y, ball.dx * cos - ball.dy * sin, ball.dx * sin + ball.dy * cos)
        steady(copy)
        g.balls.push(copy)
      }
    }
  }

  function collect({ type }) {
    const spec = POWERUPS[type]
    progress.powerups++
    particles.ring(g.paddle.x, g.paddle.y, spec.color, 55)
    particles.text(g.paddle.x, g.paddle.y - 28, spec.label.toUpperCase(), spec.color, 15)
    onSound(type === 'life' ? 'life' : type === 'shrink' ? 'bad' : 'power')
    if (type === 'life') g.lives = Math.min(MAX_LIVES, g.lives + 1)
    else if (type === 'shield') g.effects.shield = true
    else if (type === 'multi') splitBalls()
    else {
      g.effects[type] = spec.duration
      if (type === 'expand') g.effects.shrink = 0
      if (type === 'shrink') g.effects.expand = 0
    }
  }

  /** Moves one ball in small steps so it cannot pass through anything. Returns false once lost. */
  function moveBall(ball, dt) {
    const distance = speed() * dt
    const steps = Math.max(1, Math.ceil(distance / SUBSTEP))
    const step = distance / steps
    const { paddle } = g
    for (let i = 0; i < steps; i++) {
      ball.x += ball.dx * step
      ball.y += ball.dy * step
      if (bounceWalls(ball)) particles.burst(ball.x, ball.y, '#67e8f9', 2, 60)

      if (ball.dy > 0 && ball.y < paddle.y + paddle.h / 2 && circleRect(ball.x, ball.y, ball.r, paddle.x - paddle.w / 2, paddle.y, paddle.w, paddle.h)) {
        ball.y = paddle.y - ball.r
        aimFromPaddle(ball, paddle)
        paddle.squash = 1
        g.paddleHits++
        g.stall = 0
        particles.burst(ball.x, paddle.y, '#a5f3fc', 6, 110)
        onSound('paddle')
      }

      let best = null
      let touched = null
      for (const brick of g.bricks) {
        if (!brick.alive) continue
        const top = brickY(brick, g.slide)
        if (ball.y + ball.r < top || ball.y - ball.r > top + BRICK_H) continue
        const hit = circleRect(ball.x, ball.y, ball.r, brick.x, top, BRICK_W, BRICK_H)
        if (!hit) continue
        if (g.effects.fire > 0 && brick.type !== 'steel') {
          hitBrick(brick, Infinity) // fire balls go straight through
          continue
        }
        if (!best || hit.depth > best.depth) {
          best = hit
          touched = brick
        }
      }
      if (best) {
        ball.x += best.nx * best.depth
        ball.y += best.ny * best.depth
        // A ball already moving away does not hit the brick a second time.
        if (reflect(ball, best.nx, best.ny)) hitBrick(touched)
      }

      if (g.effects.shield && ball.dy > 0 && ball.y + ball.r >= SHIELD_Y) {
        ball.y = SHIELD_Y - ball.r
        reflect(ball, 0, -1)
        g.effects.shield = false
        particles.burst(ball.x, SHIELD_Y, '#22d3ee', 24, 220)
        onSound('shield')
      }
      if (ball.y - ball.r > WORLD_H) return false
    }
    return true
  }

  function updateLasers(dt) {
    g.cooldown -= dt
    const firing = input.fireKey || input.fireTouch || input.fireButton
    if (g.effects.laser > 0 && firing && g.cooldown <= 0) {
      g.cooldown = LASER_COOLDOWN
      g.bolts.push(...createBolts(g.paddle))
      onSound('laser')
    }
    for (let i = g.bolts.length - 1; i >= 0; i--) {
      const bolt = g.bolts[i]
      const before = bolt.y
      moveBolt(bolt, dt)
      // The lowest brick crossed this frame takes the hit.
      let target = null
      for (const brick of g.bricks) {
        if (!brick.alive || bolt.x < brick.x || bolt.x > brick.x + BRICK_W) continue
        const top = brickY(brick, g.slide)
        if (top < before && top + BRICK_H > bolt.y - 8 && (!target || brick.row > target.row)) target = brick
      }
      if (target) hitBrick(target)
      if (target || bolt.y < -10) g.bolts.splice(i, 1)
    }
  }

  function finish(victory) {
    if (g.status === 'ending' || g.status === 'over') return
    g.status = 'ending'
    g.victory = victory
    g.endTimer = 1.2
    onSound(victory ? 'level' : 'over')
    announce(victory ? 'ALL CLEAR!' : g.mode === 'timeAttack' ? "TIME'S UP" : 'GAME OVER')
  }

  /** Returns true when that was the last life. */
  function loseLife() {
    g.combo = 0
    shake(0.3)
    onSound('lose')
    if (g.mode === 'timeAttack') return false
    g.lives--
    if (g.lives > 0) return false
    finish(false)
    return true
  }

  /** Endless: new rows arrive from the top and push everything down. */
  function updateRows(dt) {
    g.pushTimer -= dt
    if (g.pushTimer > 0) return
    g.pushTimer = pushInterval()
    for (const brick of g.bricks) brick.row++
    for (const blast of g.blasts) blast.row++
    const line = generateRow(g.level, g.rowsMade++, random)
    for (let col = 0; col < line.length; col++) {
      if (BRICK_TYPES[line[col]]) g.bricks.push(makeBrick(line[col], 0, col, g.rowsMade))
    }
    g.total += breakableCount(g.bricks.slice(-line.length).filter((b) => b.row === 0))
    g.slide = ROW_PITCH
    const reached = g.bricks.filter((b) => b.alive && brickY(b) + BRICK_H > DANGER_Y)
    if (reached.length) {
      for (const brick of reached) {
        brick.alive = false
        particles.burst(brick.x + BRICK_W / 2, brickY(brick), '#fb7185', 6)
      }
      if (!loseLife()) announce('BREACH!', 'The wall reached you')
    }
    g.bricks = g.bricks.filter((b) => b.alive)
  }

  function clearLevel() {
    g.cleared++
    const bonus = Math.round(500 * Math.min(g.level, 10) * g.diff.score)
    g.score += bonus
    g.levelScore += bonus
    g.bonus = bonus
    g.pickups = []
    g.bolts = []
    shake(0.2)
    if (g.mode === 'classic') {
      g.balls = []
      g.effects = noEffects()
      g.status = 'clearing'
      g.endTimer = CLEAR_SECONDS
      onSound('level')
      announce('LEVEL COMPLETE', `Clear bonus +${bonus}`)
      return
    }
    // Endless and Time Attack carry straight on with a new formation.
    onSound('level')
    g.level++
    g.balls = []
    g.effects = noEffects()
    serve()
    loadFormation()
    takeSnapshot()
    announce(g.mode === 'endless' ? `WAVE ${g.level}` : 'BOARD CLEARED', `Bonus +${bonus}`)
  }

  function celebrate(dt) {
    g.endTimer -= dt
    if (random() < dt * 9) {
      const x = 60 + random() * (WORLD_W - 120)
      const y = BRICK_TOP + random() * 320
      const color = ['#22d3ee', '#a855f7', '#ec4899', '#fbbf24'][Math.floor(random() * 4)]
      particles.burst(x, y, color, 22, 230)
      particles.ring(x, y, color, 50)
    }
    if (g.endTimer > 0) return
    if (g.level >= LEVELS.length) {
      finish(true)
      return
    }
    g.status = 'complete'
    onEvent({
      type: 'levelComplete', level: g.level, name: LEVELS[g.level - 1].name, score: g.levelScore, total: g.score,
      time: g.levelTime, bricks: g.levelBricks, bonus: g.bonus,
    })
  }

  function play(dt) {
    updatePaddle(g.paddle, input, g.effects, dt)
    const pressed = input.launch
    input.launch = false
    g.intro = Math.min(1.5, g.intro + dt)
    g.slide = Math.max(0, g.slide - dt * 90)

    if (g.balls.some((b) => b.stuck)) g.waiting += dt
    for (const ball of g.balls) {
      if (!ball.stuck) continue
      ball.x = g.paddle.x
      ball.y = g.paddle.y - ball.r - 1
      if (pressed || (g.mode === 'timeAttack' && g.started && g.waiting > AUTO_LAUNCH)) launch(ball)
    }

    // Clocks and timed effects only run while a ball is in play (Time Attack: once started).
    const flying = g.balls.some((b) => !b.stuck)
    if (flying || (g.mode === 'timeAttack' && g.started)) {
      g.playTime += dt
      g.levelTime += dt
      progress.time += dt
    }
    if (flying) {
      for (const key of TIMED) g.effects[key] = Math.max(0, g.effects[key] - dt)
      g.comboTimer -= dt
      if (g.comboTimer <= 0) g.combo = 0
      g.stall += dt
      if (g.mode === 'endless') {
        updateRows(dt)
        if (g.status !== 'play') return
      }
    }

    for (let i = g.balls.length - 1; i >= 0; i--) {
      const ball = g.balls[i]
      if (ball.stuck) continue
      if (!moveBall(ball, dt)) g.balls.splice(i, 1)
      else recordTrail(ball)
    }
    // Break endless loops between the walls and unbreakable bricks.
    if (g.stall > 9) {
      g.stall = 0
      for (const ball of g.balls) {
        ball.dx += (random() - 0.5) * 0.8
        steady(ball)
      }
    }

    updateLasers(dt)
    updateBlasts(dt)
    updatePickups(g.pickups, g.paddle, dt, collect)

    if (g.mode === 'timeAttack' && g.started) {
      g.timeLeft = Math.max(0, g.timeLeft - dt)
      if (g.timeLeft <= 0) {
        finish(false)
        return
      }
    }
    if (!g.blasts.length && breakableCount(g.bricks) === 0) {
      clearLevel()
      return
    }
    if (!g.balls.length) {
      g.effects = noEffects()
      g.pickups = []
      g.bolts = []
      if (!loseLife()) serve()
    }
  }

  function update(seconds) {
    const dt = Math.min(MAX_DT, Math.max(0, seconds))
    g.clock += dt
    background.update(dt)
    if (g.status === 'idle') return
    particles.update(dt)
    g.shake = Math.max(0, g.shake - dt)
    if (g.banner) g.banner.t += dt
    if (g.banner?.t > 1.8 && g.status === 'play') g.banner = null
    for (const brick of g.bricks) if (brick.flash > 0) brick.flash = Math.max(0, brick.flash - dt * 7)

    if (g.status === 'play') play(dt)
    else if (g.status === 'clearing') {
      updatePaddle(g.paddle, input, g.effects, dt)
      celebrate(dt)
    } else if (g.status === 'ending') {
      g.endTimer -= dt
      if (g.endTimer <= 0) {
        g.status = 'over'
        onEvent({ type: 'over', ...summary() })
      }
    }
  }

  const summary = () => ({
    mode: g.mode, difficulty: g.difficulty, victory: g.victory, score: g.score, level: g.level,
    cleared: g.cleared, bricks: g.bricksDestroyed, time: g.playTime,
  })

  /** Returns what happened since the last call, so it is saved exactly once. */
  function takeProgress() {
    if (g.status === 'idle') return null
    const delta = progress
    progress = { bricks: 0, powerups: 0, time: 0 }
    return { ...delta, mode: g.mode, score: g.score, level: g.level }
  }

  function hud() {
    if (g.status === 'idle') return null
    return {
      mode: g.mode,
      score: g.score,
      level: g.level,
      lives: g.lives,
      left: breakableCount(g.bricks),
      total: g.total,
      multiplier: multiplier(),
      combo: g.combo,
      timeLeft: Math.ceil(g.timeLeft),
      nextRow: g.mode === 'endless' ? Math.ceil(g.pushTimer) : 0,
      waiting: g.status === 'play' && g.balls.some((b) => b.stuck),
      laser: g.effects.laser > 0,
      effects: [
        ...TIMED.filter((k) => g.effects[k] > 0).map((k) => ({ key: k, left: Math.ceil(g.effects[k]) })),
        ...(g.effects.shield ? [{ key: 'shield', left: 0 }] : []),
      ],
    }
  }

  function drawBanner(ctx, { title, subtitle, t }) {
    const fade = g.status === 'play' ? clamp((1.8 - t) * 2.5, 0, 1) : 1
    const grow = Math.min(1, t * 5)
    ctx.save()
    ctx.globalAlpha = fade * grow
    ctx.translate(WORLD_W / 2, 440)
    ctx.scale(0.8 + grow * 0.2, 0.8 + grow * 0.2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 18
    ctx.font = '900 38px Nunito, sans-serif'
    ctx.fillText(title, 0, 0)
    if (subtitle) {
      ctx.fillStyle = '#67e8f9'
      ctx.font = '700 18px Nunito, sans-serif'
      ctx.fillText(subtitle, 0, 34)
    }
    ctx.restore()
  }

  function draw(ctx) {
    ctx.save()
    background.draw(ctx)
    if (g.status === 'idle') {
      ctx.restore()
      return
    }
    if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake * 16, (Math.random() - 0.5) * g.shake * 16)
    if (g.mode === 'endless') {
      ctx.strokeStyle = 'rgba(251,113,133,0.45)'
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(0, DANGER_Y)
      ctx.lineTo(WORLD_W, DANGER_Y)
      ctx.stroke()
      ctx.setLineDash([])
    }
    drawBricks(ctx, g.bricks, { slide: g.slide, intro: g.intro, clock: g.clock })
    drawPickups(ctx, g.pickups)
    drawBolts(ctx, g.bolts)
    if (g.effects.shield) drawShield(ctx, g.clock)
    drawPaddle(ctx, g.paddle, g.effects)
    drawBalls(ctx, g.balls, g.effects.fire > 0)
    particles.draw(ctx)
    if (g.banner) drawBanner(ctx, g.banner)
    if (g.status === 'play' && g.balls.some((b) => b.stuck)) {
      ctx.globalAlpha = 0.65 + Math.sin(g.clock * 5) * 0.3
      ctx.fillStyle = '#bae6fd'
      ctx.font = '700 16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Tap, click or press Space to launch', WORLD_W / 2, g.paddle.y - 60)
    }
    ctx.restore()
  }

  return { state: g, input, start, nextLevel, replayLevel, stop, update, draw, hud, summary, takeProgress }
}
