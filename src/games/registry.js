import { lazy } from 'react'
import { GAMES } from '../data/games.meta.js'

// Each game is its own lazy chunk: ./<Folder>/index.jsx (default export = component)
const loaders = import.meta.glob('./*/index.jsx')

export const GAME_COMPONENTS = Object.fromEntries(
  GAMES.map((g) => [g.slug, lazy(loaders[`./${g.folder}/index.jsx`])]),
)
