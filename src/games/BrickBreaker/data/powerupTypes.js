// duration 0 = instant, or (shield) lasts until used. weight = relative drop chance.
export const POWERUPS = {
  expand: { label: 'Expand', color: '#34d399', duration: 15, weight: 14 },
  shrink: { label: 'Shrink', color: '#fb7185', duration: 10, weight: 7 },
  multi: { label: 'Multi Ball', color: '#38bdf8', duration: 0, weight: 14 },
  laser: { label: 'Laser', color: '#f43f5e', duration: 10, weight: 11 },
  slow: { label: 'Slow Ball', color: '#a5b4fc', duration: 10, weight: 12 },
  fire: { label: 'Fire Ball', color: '#fb923c', duration: 8, weight: 10 },
  life: { label: 'Extra Life', color: '#f472b6', duration: 0, weight: 5 },
  shield: { label: 'Shield', color: '#22d3ee', duration: 0, weight: 10 },
}

/** Weighted random power-up. Extra Life is left out when lives do not matter. */
export function pickPowerup(random, allowLife = true) {
  const entries = Object.entries(POWERUPS).filter(([key]) => allowLife || key !== 'life')
  let roll = random() * entries.reduce((sum, [, p]) => sum + p.weight, 0)
  for (const [key, p] of entries) {
    roll -= p.weight
    if (roll < 0) return key
  }
  return entries[0][0]
}
