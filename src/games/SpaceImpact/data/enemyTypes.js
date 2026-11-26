// `fire` is the average seconds between shots. `from` is the first wave the type appears in.
export const ENEMY_TYPES = {
  basic: { hp: 20, r: 18, speed: 130, score: 100, fire: 2.6, shot: { kind: 'orb', speed: 290, damage: 20, r: 5 }, from: 1, weight: 6, color: '#a855f7', drop: 0.1 },
  fast: { hp: 10, r: 13, speed: 300, score: 150, fire: 0, shot: null, from: 2, weight: 4, color: '#38bdf8', drop: 0.1 },
  heavy: { hp: 90, r: 30, speed: 70, score: 350, fire: 2.8, shot: { kind: 'plasma', speed: 220, damage: 35, r: 10 }, from: 3, weight: 2, color: '#f43f5e', drop: 0.35 },
  bomber: { hp: 45, r: 24, speed: 105, score: 250, fire: 1.5, shot: { kind: 'bomb', speed: 60, damage: 30, r: 8 }, from: 4, weight: 2, color: '#f59e0b', drop: 0.25 },
}

export const BOSS_TYPES = [
  { name: 'Void Warden', color: '#a855f7', patterns: ['aimed', 'fan'] },
  { name: 'Ion Hydra', color: '#22d3ee', patterns: ['fan', 'ring', 'aimed', 'charge'] },
  { name: 'Star Leviathan', color: '#f43f5e', patterns: ['beam', 'ring', 'fan', 'charge', 'aimed'] },
]

export const BOSS_BASE = { hp: 900, hpPerTier: 0.65, r: 62, score: 2000, damage: 20 }
