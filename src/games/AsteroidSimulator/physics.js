// Simplified, order-of-magnitude impact estimates (loosely after Collins, Melosh & Marcus 2005).
// For education only — these are NOT predictions.
export const MATERIALS = {
  stony: { label: 'Stony', density: 3000, breakup: 50 },
  iron: { label: 'Iron', density: 7800, breakup: 15 },
  icy: { label: 'Icy / cometary', density: 900, breakup: 100 },
}
export const MEGATON_J = 4.184e15
export const HIROSHIMA_MT = 0.015

// (diameter m, approx interval years) — rough, commonly cited orders of magnitude
const FREQ = [[5, 1], [20, 50], [50, 1000], [140, 20000], [1000, 500000], [10000, 1e8]]

function interval(d) {
  if (d <= FREQ[0][0]) return FREQ[0][1]
  for (let i = 1; i < FREQ.length; i++) {
    if (d <= FREQ[i][0]) {
      const [d0, y0] = FREQ[i - 1], [d1, y1] = FREQ[i]
      const t = (Math.log(d) - Math.log(d0)) / (Math.log(d1) - Math.log(d0))
      return Math.exp(Math.log(y0) + t * (Math.log(y1) - Math.log(y0)))
    }
  }
  return 1e9
}

export function simulate({ diameter, speed, angle, material, land }) {
  const m = MATERIALS[material]
  const L = diameter
  const v = speed * 1000
  const mass = m.density * (Math.PI / 6) * L ** 3
  const energyJ = 0.5 * mass * v ** 2
  const mt = energyJ / MEGATON_J
  const sinT = Math.sin((angle * Math.PI) / 180)
  const airburst = L < m.breakup
  const g = 9.81
  const cbrt = Math.cbrt(mt)

  let craterKm = 0
  if (!airburst && land) {
    const rhoT = 2500
    const dt = 1.161 * Math.cbrt(m.density / rhoT) * L ** 0.78 * v ** 0.44 * g ** -0.22 * Math.cbrt(sinT)
    craterKm = (dt * 1.25) / 1000
  }
  const severeKm = Math.max(0.05, 4.7 * cbrt * (airburst ? 1 : 0.8)) // ~5 psi overpressure
  const lightKm = Math.max(0.1, 11 * cbrt) // ~1 psi, windows shatter
  const burnKm = Math.max(0.05, 5.5 * mt ** 0.41) // thermal burns (very rough)
  const magnitude = Math.max(0, Math.min(11, 0.67 * Math.log10(energyJ) - 5.87)) * (land ? 1 : 0.9)
  const area = Math.PI * lightKm ** 2

  return {
    massKg: mass, energyJ, mt, airburst, craterKm, severeKm, lightKm, burnKm, magnitude, area,
    hiroshimas: mt / HIROSHIMA_MT,
    everyYears: interval(L),
    ocean: !land,
    tsunami: !land && mt > 1,
    global: mt > 1e5,
  }
}

export function formatNum(n) {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' trillion'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' billion'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million'
  if (n >= 100) return Math.round(n).toLocaleString()
  if (n >= 1) return n.toFixed(1)
  return n.toPrecision(2)
}

export function cityComparison(km2) {
  if (km2 < 1) return 'smaller than a city block cluster'
  const cities = [['a small town', 5], ['Manhattan', 59], ['Paris (inner city)', 105], ['London (Greater)', 1572], ['the island of Puerto Rico', 9100], ['a country the size of Portugal', 92000], ['a continent-scale region', 1e7]]
  const pick = cities.filter(([, a]) => a <= km2).at(-1) || cities[0]
  const k = km2 / pick[1]
  return k < 1.5 ? `about the size of ${pick[0]}` : `about ${k.toFixed(k < 10 ? 1 : 0)}× the area of ${pick[0]}`
}
