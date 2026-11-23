import { useSyncExternalStore } from 'react'
import { readItem, writeItem, removeItem, PREFIX } from './local.js'

const registry = new Set()

/** Small observable store persisted to LocalStorage. */
export function createStore(key, initial, validate) {
  let value = readItem(key, initial, validate)
  const subs = new Set()
  const emit = () => subs.forEach((f) => f())
  const store = {
    key,
    get: () => value,
    set(next) {
      const v = typeof next === 'function' ? next(value) : next
      if (Object.is(v, value)) return
      value = v
      writeItem(key, v)
      emit()
    },
    reset() {
      removeItem(key)
      value = initial
      emit()
    },
    reload() {
      value = readItem(key, initial, validate)
      emit()
    },
    subscribe(f) {
      subs.add(f)
      return () => subs.delete(f)
    },
  }
  registry.add(store)
  return store
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

export function resetAllStores() {
  registry.forEach((s) => s.reset())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return
    registry.forEach((s) => {
      if (PREFIX + s.key === e.key) s.reload()
    })
  })
}

// ---- per-game data stores (cached so every component shares one store) ----
const gameStores = new Map()
export function gameStore(slug, name, initial, validate) {
  const key = `game:${slug}:${name}`
  if (!gameStores.has(key)) gameStores.set(key, createStore(key, initial, validate))
  return gameStores.get(key)
}
