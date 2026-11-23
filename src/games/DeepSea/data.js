export const MAX_DEPTH = 10935 // Challenger Deep, approx. metres

export const ZONES = [
  { from: 0, name: 'Sunlight zone', text: 'Enough light for photosynthesis. Most marine life lives here (0–200 m).' },
  { from: 200, name: 'Twilight zone', text: 'Faint light remains but plants cannot grow (200–1,000 m).' },
  { from: 1000, name: 'Midnight zone', text: 'No sunlight at all; many animals make their own light (1,000–4,000 m).' },
  { from: 4000, name: 'Abyssal zone', text: 'Near-freezing water under crushing pressure (4,000–6,000 m).' },
  { from: 6000, name: 'Hadal zone', text: 'The deep ocean trenches, named after Hades (6,000 m+).' },
]

export const FACTS = [
  { depth: 20, emoji: '🐢', title: 'Sea turtles', text: 'Most species dive only a few hundred meters, but they breathe air at the surface.' },
  { depth: 120, emoji: '🐬', title: 'Dolphins', text: 'Bottlenose dolphins typically stay shallow, yet can dive hundreds of meters.' },
  { depth: 400, emoji: '🦈', title: 'Sharks', text: 'Some sharks patrol the twilight zone, hunting in dim blue light.' },
  { depth: 800, emoji: '🐋', title: 'Sperm whales', text: 'Champion divers: they can descend beyond 1,000 meters on a single breath.' },
  { depth: 1200, emoji: '🦑', title: 'Giant squid', text: 'Eyes the size of dinner plates help it see faint glows in the dark.' },
  { depth: 2000, emoji: '🐙', title: 'Dumbo octopus', text: 'Flaps ear-like fins to glide above the seafloor.' },
  { depth: 2800, emoji: '🎣', title: 'Anglerfish', text: 'A glowing lure on its head attracts prey in total darkness.' },
  { depth: 3800, emoji: '🪼', title: 'Bioluminescent jellies', text: 'Most animals in the deep make their own light.' },
  { depth: 4800, emoji: '🦠', title: 'Hydrothermal vents', text: 'Chemical-fed ecosystems that thrive without sunlight.' },
  { depth: 5200, emoji: '🥒', title: 'Sea cucumbers', text: 'Often the most abundant animals on the deep seafloor.' },
  { depth: 6800, emoji: '🦐', title: 'Amphipods', text: 'Small shrimp-like scavengers living in ocean trenches.' },
  { depth: 8000, emoji: '🐟', title: 'Snailfish', text: 'Some species live at about 8,000 m, close to the limits of fish survival.' },
  { depth: 10900, emoji: '🧭', title: 'Challenger Deep', text: 'The deepest known point in the ocean, roughly 10,935 m below the surface.' },
]

const STOPS = [[0, [86, 190, 235]], [200, [34, 120, 190]], [1000, [14, 48, 110]], [4000, [8, 20, 55]], [MAX_DEPTH, [2, 4, 16]]]
export function colorAt(d) {
  for (let i = 1; i < STOPS.length; i++) {
    if (d <= STOPS[i][0]) {
      const [d0, c0] = STOPS[i - 1]
      const [d1, c1] = STOPS[i]
      const t = (d - d0) / (d1 - d0)
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(',')})`
    }
  }
  return 'rgb(2,4,16)'
}
