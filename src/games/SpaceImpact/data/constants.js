export const SLUG = 'space-impact'

// The world has a fixed height. Its width follows the screen shape, within these limits.
export const WORLD_H = 540
export const WORLD_MIN_W = 600
export const WORLD_MAX_W = 1100
export const MAX_DT = 1 / 30

export const PLAYER = { r: 15, speed: 340, maxHp: 100, hitInvincible: 1.2, spawnInvincible: 2.5, respawnDelay: 1.3 }

export const DIFFICULTIES = {
  easy: { label: 'Easy', spawn: 0.75, speed: 0.85, hp: 0.8, fire: 0.65, boss: 0.7, obstacle: 0.7, damage: 0.75, score: 0.75 },
  normal: { label: 'Normal', spawn: 1, speed: 1, hp: 1, fire: 1, boss: 1, obstacle: 1, damage: 1, score: 1 },
  hard: { label: 'Hard', spawn: 1.35, speed: 1.2, hp: 1.3, fire: 1.4, boss: 1.4, obstacle: 1.35, damage: 1.2, score: 1.5 },
}

export const MODES = {
  classic: { label: 'Classic', hint: 'Endless waves. Bosses arrive as your score climbs.', lives: 3, weapon: 0 },
  boss: { label: 'Boss Rush', hint: 'Defeat three bosses in a row to win.', lives: 3, weapon: 1 },
  survival: { label: 'Survival', hint: 'Two lives. You score for every second you stay alive.', lives: 2, weapon: 0 },
}

export const WAVE_SECONDS = 22
export const BOSS_RUSH_COUNT = 3
export const FIRST_BOSS_SCORE = 2500
export const BOSS_SCORE_STEP = 5000
export const SURVIVAL_POINTS_PER_SECOND = 10
