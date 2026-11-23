// Versioned, validated LocalStorage wrapper. Never throws.
export const PREFIX = 'dbx:'
export const SCHEMA_VERSION = 1

const memory = new Map() // fallback when storage is unavailable or full
let available

function ls() {
  if (available === false) return null
  try {
    const s = window.localStorage
    const t = '__dbx_test__'
    s.setItem(t, t)
    s.removeItem(t)
    available = true
    return s
  } catch {
    available = false
    return null
  }
}

export function isStorageAvailable() {
  return ls() !== null
}

/** Migrations keyed by the version they upgrade FROM. */
const migrations = {}

export function readItem(key, fallback, validate) {
  const full = PREFIX + key
  let raw = null
  try {
    const s = ls()
    raw = s ? s.getItem(full) : memory.get(full) ?? null
  } catch {
    raw = memory.get(full) ?? null
  }
  if (raw == null) return fallback
  try {
    let env = JSON.parse(raw)
    if (!env || typeof env !== 'object' || typeof env.v !== 'number') return fallback
    while (env.v < SCHEMA_VERSION && migrations[env.v]) env = migrations[env.v](env)
    if (env.v !== SCHEMA_VERSION) return fallback
    if (validate && !validate(env.d)) return fallback
    return env.d
  } catch {
    return fallback
  }
}

export function writeItem(key, value) {
  const full = PREFIX + key
  const raw = JSON.stringify({ v: SCHEMA_VERSION, d: value })
  memory.set(full, raw)
  try {
    const s = ls()
    if (!s) return false
    s.setItem(full, raw)
    return true
  } catch {
    return false // quota exceeded etc. — value still lives in memory for this session
  }
}

export function removeItem(key) {
  const full = PREFIX + key
  memory.delete(full)
  try {
    ls()?.removeItem(full)
  } catch {
    /* ignore */
  }
}

export function listKeys() {
  const out = new Set([...memory.keys()])
  try {
    const s = ls()
    if (s) {
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i)
        if (k && k.startsWith(PREFIX)) out.add(k)
      }
    }
  } catch {
    /* ignore */
  }
  return [...out].map((k) => k.slice(PREFIX.length))
}

export function clearAllLocal() {
  for (const k of listKeys()) removeItem(k)
  memory.clear()
}

export function usageBytes() {
  let n = 0
  for (const k of listKeys()) {
    try {
      n += (ls()?.getItem(PREFIX + k) || memory.get(PREFIX + k) || '').length * 2
    } catch {
      /* ignore */
    }
  }
  return n
}
