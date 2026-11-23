import { createStore, resetAllStores } from './store.js'
import { clearAllLocal } from './local.js'
import { idbClearAll } from './idb.js'

export * from './local.js'
export * from './idb.js'
export * from './store.js'

const isArr = Array.isArray
export const themeStore = createStore('theme', 'dark', (v) => ['system', 'light', 'dark'].includes(v))
export const soundStore = createStore('sound', true, (v) => typeof v === 'boolean')
export const favoritesStore = createStore('favorites', [], (v) => isArr(v) && v.every((x) => typeof x === 'string'))
export const recentStore = createStore(
  'recent',
  [],
  (v) => isArr(v) && v.every((x) => x && typeof x.slug === 'string' && typeof x.at === 'number'),
)

export function toggleFavorite(slug) {
  favoritesStore.set((f) => (f.includes(slug) ? f.filter((s) => s !== slug) : [...f, slug]))
}

export function markPlayed(slug) {
  recentStore.set((r) => [{ slug, at: Date.now() }, ...r.filter((x) => x.slug !== slug)].slice(0, 12))
}

export async function resetEverything() {
  clearAllLocal()
  await idbClearAll()
  resetAllStores()
}
