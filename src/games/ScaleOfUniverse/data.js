// size = approximate typical diameter/length in metres
export const OBJECTS = [
  { name: 'Planck length', emoji: '〰️', size: 1.6e-35, color: '#a78bfa' },
  { name: 'Quark (upper bound)', emoji: '⚛️', size: 1e-18, color: '#c084fc' },
  { name: 'Proton', emoji: '🔴', size: 1.7e-15, color: '#f87171' },
  { name: 'Hydrogen atom', emoji: '⚛️', size: 1.1e-10, color: '#fb923c' },
  { name: 'DNA width', emoji: '🧬', size: 2e-9, color: '#fbbf24' },
  { name: 'Virus', emoji: '🦠', size: 1e-7, color: '#a3e635' },
  { name: 'Red blood cell', emoji: '🩸', size: 7.5e-6, color: '#ef4444' },
  { name: 'Human hair width', emoji: '〰️', size: 7e-5, color: '#d6d3d1' },
  { name: 'Ant', emoji: '🐜', size: 5e-3, color: '#f59e0b' },
  { name: 'Basketball', emoji: '🏀', size: 0.24, color: '#fb923c' },
  { name: 'Human', emoji: '🧍', size: 1.7, color: '#38bdf8' },
  { name: 'Blue whale', emoji: '🐋', size: 28, color: '#60a5fa' },
  { name: 'Football pitch', emoji: '🏟️', size: 105, color: '#4ade80' },
  { name: 'Mount Everest', emoji: '🏔️', size: 8.8e3, color: '#e2e8f0' },
  { name: 'Earth', emoji: '🌍', size: 1.27e7, color: '#22d3ee' },
  { name: 'Jupiter', emoji: '🪐', size: 1.4e8, color: '#fdba74' },
  { name: 'Sun', emoji: '☀️', size: 1.39e9, color: '#facc15' },
  { name: 'Betelgeuse', emoji: '⭐', size: 1.2e12, color: '#f87171' },
  { name: 'Solar system (to Neptune)', emoji: '🌌', size: 9e12, color: '#818cf8' },
  { name: 'Light-year', emoji: '💡', size: 9.46e15, color: '#fde047' },
  { name: 'Oort cloud', emoji: '☄️', size: 3e16, color: '#94a3b8' },
  { name: 'Orion Nebula', emoji: '🌫️', size: 2.3e17, color: '#f472b6' },
  { name: 'Milky Way', emoji: '🌌', size: 9.5e20, color: '#c4b5fd' },
  { name: 'Local Group', emoji: '✨', size: 9e22, color: '#67e8f9' },
  { name: 'Virgo Supercluster', emoji: '🔭', size: 1e24, color: '#86efac' },
  { name: 'Observable universe', emoji: '🌐', size: 8.8e26, color: '#fca5a5' },
]

const UNITS = [
  [9.46e15, 'light-years'],
  [1.496e11, 'AU'],
  [1000, 'km'],
  [1, 'm'],
  [1e-2, 'cm'],
  [1e-3, 'mm'],
  [1e-6, 'µm'],
  [1e-9, 'nm'],
  [1e-12, 'pm'],
  [1e-15, 'fm'],
  [1e-18, 'am'],
]

export function fmtLength(m) {
  if (m < 1e-18) return `${m.toExponential(1)} m`
  if (m >= 1e16 * 0.95) {
    const ly = m / 9.46e15
    return ly >= 1e6 ? `${ly.toExponential(1).replace('e+', ' × 10^')} light-years` : `${Math.round(ly).toLocaleString()} light-years`
  }
  for (const [v, u] of UNITS) {
    if (m >= v * 0.95) {
      const x = m / v
      return `${x >= 100 ? Math.round(x) : x >= 10 ? x.toFixed(1) : x.toFixed(2)} ${u}`
    }
  }
  return `${m.toExponential(1)} m`
}
