// Framework-free game simulation. update() has no DOM access, so it can run outside a browser.
import {
  BOSS_RUSH_COUNT, BOSS_SCORE_STEP, DIFFICULTIES, FIRST_BOSS_SCORE, MAX_DT, MODES, PLAYER,
  SURVIVAL_POINTS_PER_SECOND, WAVE_SECONDS, WORLD_H, WORLD_MAX_W, WORLD_MIN_W,
} from '../data/constants.js'
import { WEAPONS } from '../data/weapons.js'
import { createBackground, drawBackground, updateBackground } from './background.js'
import { damageBoss, drawBoss, spawnBoss, updateBoss } from './boss.js'
import { circleRectHit, circlesHit, sweptHit } from './collision.js'
import { damageEnemy, drawEnemies, pickEnemyType, spawnEnemy, updateEnemies } from './enemies.js'
import { damageObstacle, drawObstacles, gateRects, spawnObstacle, updateObstacles } from './obstacles.js'
import { burst, createParticles, drawParticles, popup, updateParticles } from './particles.js'
import { createPlayer, damagePlayer, drawPlayer, updatePlayer } from './player.js'
import { clamp, rand } from './pool.js'
import { drawPowerups, dropPowerup, updatePowerups } from './powerups.js'
import { createShots, drawShots, updateShots } from './projectiles.js'

export const createInput = () => ({ up: false, down: false, left: false, right: false, fire: false, ax: 0, ay: 0, touchFire: false })

export function createEngine({ onSound = () => {}, onEnd = () => {}, reducedMotion = false } = {}) {
  const g = {
    w: 960,
    clock: 0,
    input: createInput(),
    background: createBackground(),
    particles: createParticles(),
    playerShots: createShots(160),
    enemyShots: createShots(220),
    running: false,
    emit: onSound,
    shake(amount) {
      if (!reducedMotion) g.shakeTime = Math.max(g.shakeTime, amount)
    },
    addScore(base, x, y) {
      if (!base || g.ending) return
      const points = Math.round(base * g.diff.score * (g.player.multi > 0 ? 2 : 1))
      g.score += points
      if (x != null) popup(g, x, y, `+${points}`)
    },
    onBossDefeated() {
      g.nextBossScore = g.score + BOSS_SCORE_STEP
      g.timers.bossDelay = 2.8
      if (g.mode === 'classic') {
        g.wave++
        popup(g, g.w / 2, 110, 'BOSS DESTROYED', '#86efac')
      } else if (g.bossKills >= BOSS_RUSH_COUNT) {
        finish(true)
      }
    },
  }

  function reset(mode, difficulty) {
    g.mode = mode
    g.difficulty = difficulty
    g.diff = DIFFICULTIES[difficulty]
    g.baseWeapon = MODES[mode].weapon
    g.player = createPlayer(MODES[mode])
    g.enemies = []
    g.obstacles = []
    g.powerups = []
    g.boss = null
    g.particles.clear()
    g.playerShots.clear()
    g.enemyShots.clear()
    Object.assign(g, {
      score: 0, scoreCarry: 0, kills: 0, bossKills: 0, time: 0, wave: 1, waveClock: 0, ramp: 1,
      nextBossScore: FIRST_BOSS_SCORE, shakeTime: 0, ending: null, endTimer: 0, committed: false,
      timers: { enemy: 1.2, obstacle: 3, gate: 14, powerup: 9, bossDelay: mode === 'boss' ? 2 : 0 },
    })
  }
  reset('classic', 'normal')
  g.committed = true // nothing to save until a run starts

  function finish(victory) {
    if (g.ending) return
    g.ending = { victory }
    g.endTimer = victory ? 2.4 : 1.7
  }

  function result() {
    return {
      mode: g.mode, difficulty: g.difficulty, score: g.score, kills: g.kills,
      time: g.time, bosses: g.bossKills, victory: Boolean(g.ending?.victory),
    }
  }

  function spawn(dt) {
    const t = g.timers
    if (g.mode === 'boss') {
      if (!g.boss) {
        t.bossDelay -= dt
        if (t.bossDelay <= 0) {
          g.wave = g.bossKills + 1
          spawnBoss(g, g.bossKills)
        }
      }
    } else {
      g.waveClock += dt
      if (g.waveClock >= WAVE_SECONDS && !g.boss) {
        g.waveClock = 0
        g.wave++
        popup(g, g.w / 2, 110, `WAVE ${g.wave}`, '#67e8f9')
      }
      t.bossDelay = Math.max(0, t.bossDelay - dt)
      if (g.mode === 'classic' && !g.boss && t.bossDelay <= 0 && g.score >= g.nextBossScore) spawnBoss(g, g.bossKills)
    }
    g.ramp = 1 + Math.min(g.wave - 1, 20) * 0.08

    t.powerup -= dt
    if (t.powerup <= 0) {
      t.powerup = g.boss ? rand(7, 10) : rand(13, 18)
      dropPowerup(g, g.w + 20, rand(60, WORLD_H - 60))
    }
    if (g.boss || g.mode === 'boss') return // boss fights have a clear arena

    t.enemy -= dt
    if (t.enemy <= 0) {
      t.enemy = (rand(1.1, 1.8) / (g.diff.spawn * g.ramp)) * (g.mode === 'survival' ? 0.9 : 1)
      const type = pickEnemyType(g.wave)
      if (type === 'fast' && Math.random() < 0.4) {
        const y = rand(110, WORLD_H - 110)
        for (let i = 0; i < 3; i++) spawnEnemy(g, 'fast', y + (i - 1) * 40, Math.abs(i - 1) * 45)
      } else spawnEnemy(g, type)
    }
    t.obstacle -= dt
    if (t.obstacle <= 0) {
      t.obstacle = rand(2.4, 4.2) / (g.diff.obstacle * (1 + (g.ramp - 1) * 0.5))
      const roll = Math.random()
      spawnObstacle(g, g.wave >= 3 && roll < 0.22 ? 'mine' : roll < 0.5 ? 'debris' : 'asteroid')
    }
    if (g.wave >= 2) {
      t.gate -= dt
      if (t.gate <= 0) {
        t.gate = rand(15, 22) / g.diff.obstacle
        spawnObstacle(g, 'gate')
      }
    }
  }

  function collidePlayerShots() {
    for (const s of g.playerShots.items) {
      if (!s.active) continue
      const hit = (t, r) => sweptHit(s.px, s.py, s.x, s.y, s.r, t.x, t.y, r)
      const enemy = g.enemies.find((e) => !e.dead && e.x < g.w + e.r * 0.5 && hit(e, e.r))
      if (enemy) {
        s.active = false
        damageEnemy(g, enemy, s.damage)
        continue
      }
      if (g.boss && hit(g.boss, g.boss.r * 0.85)) {
        s.active = false
        burst(g, s.x, s.y, s.color, 3, 110, 3)
        damageBoss(g, s.damage)
        continue
      }
      const rock = g.obstacles.find((o) => !o.dead && (o.kind === 'gate'
        ? gateRects(o).some((r) => circleRectHit(s.x, s.y, s.r, ...r))
        : o.x < g.w + o.r * 0.5 && hit(o, o.r * 0.9)))
      if (rock) {
        s.active = false
        damageObstacle(g, rock, s.damage)
      }
    }
  }

  function collideShips() {
    const p = g.player
    if (!p.alive) return
    const shielded = p.shield > 0
    const radius = shielded ? 32 : PLAYER.r
    for (const s of g.enemyShots.items) {
      if (!s.active || !sweptHit(s.px, s.py, s.x, s.y, s.r * 0.8, p.x, p.y, radius)) continue
      s.active = false
      if (shielded) burst(g, s.x, s.y, '#7dd3fc', 5, 120, 3)
      else damagePlayer(g, s.damage)
      if (!p.alive) return
    }
    for (const e of g.enemies) {
      if (e.dead || !circlesHit(e.x, e.y, e.r * 0.8, p.x, p.y, radius)) continue
      if (shielded || damagePlayer(g, 35 * g.diff.damage)) damageEnemy(g, e, 70)
      if (!p.alive) return
    }
  }

  function step(dt) {
    g.clock += dt
    updateBackground(g.background, dt, g.running && !g.ending ? 1.6 : 1)
    if (!g.running) {
      updateParticles(g, dt)
      return
    }
    g.shakeTime = Math.max(0, g.shakeTime - dt)
    const p = g.player
    if (!g.ending) {
      if (p.alive) {
        g.time += dt
        if (g.mode === 'survival') {
          g.scoreCarry += dt * SURVIVAL_POINTS_PER_SECOND * g.diff.score * (p.multi > 0 ? 2 : 1)
          const whole = Math.floor(g.scoreCarry)
          g.score += whole
          g.scoreCarry -= whole
        }
      }
      spawn(dt)
    }
    updatePlayer(g, dt)
    updateEnemies(g, dt)
    updateBoss(g, dt)
    updateObstacles(g, dt)
    updateShots(g, g.playerShots, dt)
    updateShots(g, g.enemyShots, dt)
    collidePlayerShots()
    collideShips()
    updatePowerups(g, dt)
    updateParticles(g, dt)

    if (!p.alive && p.lives <= 0) {
      // Dying beats winning when both happen together.
      if (!g.ending || g.ending.victory) {
        g.ending = null
        finish(false)
      }
    }
    if (g.ending) {
      g.endTimer -= dt
      if (g.endTimer <= 0) {
        g.running = false
        onEnd(result())
      }
    }
  }

  return {
    state: g,
    input: g.input,
    update: (dt) => step(Math.min(Math.max(dt, 0), MAX_DT)),
    start(mode, difficulty) {
      reset(mode, difficulty)
      g.running = true
    },
    /** Returns to the idle backdrop (menu). */
    stop() {
      g.running = false
      reset(g.mode, g.difficulty)
      g.committed = true
    },
    /** The current run's statistics, handed out exactly once so they are never saved twice. */
    takeResult() {
      if (g.committed) return null
      g.committed = true
      return result()
    },
    resize(width) {
      g.w = clamp(width, WORLD_MIN_W, WORLD_MAX_W)
      if (g.player) g.player.x = Math.min(g.player.x, g.w - 40)
    },
    hud() {
      const p = g.player
      return {
        score: g.score, lives: Math.max(0, p.lives), hp: Math.ceil((p.hp / PLAYER.maxHp) * 100),
        weapon: WEAPONS[p.weapon].name, wave: g.wave, time: Math.floor(g.time),
        shield: Math.ceil(p.shield), rapid: Math.ceil(p.rapid), multi: Math.ceil(p.multi),
        boss: g.boss ? { name: g.boss.name, color: g.boss.color, percent: Math.max(0, Math.ceil((g.boss.hp / g.boss.maxHp) * 100)) } : null,
      }
    },
    draw(ctx) {
      ctx.save()
      if (g.shakeTime > 0) {
        const power = Math.min(g.shakeTime, 0.5) * 14
        ctx.translate(rand(-power, power), rand(-power, power))
      }
      drawBackground(ctx, g.background, g.w)
      if (g.running || g.ending) {
        drawObstacles(ctx, g)
        drawPowerups(ctx, g)
        drawEnemies(ctx, g)
        drawBoss(ctx, g)
        drawShots(ctx, g)
        drawPlayer(ctx, g)
      }
      drawParticles(ctx, g)
      ctx.restore()
    },
  }
}
