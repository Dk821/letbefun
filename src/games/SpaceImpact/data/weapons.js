// A weapon upgrade moves one step along this list; losing a life moves one step back.
// Each shot: vertical offset (dy), angle in radians and damage.
export const WEAPONS = [
  { id: 'laser', name: 'Standard Laser', cooldown: 0.22, color: '#22d3ee', shots: [{ dy: 0, angle: 0, damage: 10 }] },
  { id: 'double', name: 'Double Laser', cooldown: 0.23, color: '#60a5fa', shots: [{ dy: -9, angle: 0, damage: 9 }, { dy: 9, angle: 0, damage: 9 }] },
  // Rapid fire alternates between two barrels.
  { id: 'rapid', name: 'Rapid Fire', cooldown: 0.095, color: '#a3e635', alternate: 7, shots: [{ dy: 0, angle: 0, damage: 8 }] },
  { id: 'triple', name: 'Triple Laser', cooldown: 0.23, color: '#c084fc', shots: [{ dy: -15, angle: 0, damage: 9 }, { dy: 0, angle: 0, damage: 9 }, { dy: 15, angle: 0, damage: 9 }] },
  { id: 'spread', name: 'Spread Shot', cooldown: 0.28, color: '#f0abfc', shots: [-0.3, -0.15, 0, 0.15, 0.3].map((angle) => ({ dy: 0, angle, damage: 9 })) },
]

export const PLAYER_SHOT_SPEED = 900
export const RAPID_BOOST = 0.55 // cooldown multiplier while the rapid-fire power-up is active
