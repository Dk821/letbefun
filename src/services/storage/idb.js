// Tiny IndexedDB key-value layer organised in "collections". Falls back to memory.
const DB_NAME = 'doodlebox'
const STORE = 'items'
const VERSION = 1
const mem = new Map()
let dbPromise

function open() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    try {
      const req = indexedDB.open(DB_NAME, VERSION)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

function run(db, mode, fn) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode)
      const store = tx.objectStore(STORE)
      const req = fn(store)
      tx.oncomplete = () => resolve(req ? req.result : undefined)
      tx.onerror = tx.onabort = () => resolve(undefined)
    } catch {
      resolve(undefined)
    }
  })
}

const k = (c, key) => `${c}/${key}`
const wrap = (d) => ({ v: 1, d })
const unwrap = (e) => (e && e.v === 1 ? e.d : undefined)

export async function idbGet(collection, key) {
  const db = await open()
  if (!db) return mem.has(k(collection, key)) ? unwrap(mem.get(k(collection, key))) : undefined
  return unwrap(await run(db, 'readonly', (s) => s.get(k(collection, key))))
}

export async function idbSet(collection, key, value) {
  mem.set(k(collection, key), wrap(value))
  const db = await open()
  if (db) await run(db, 'readwrite', (s) => s.put(wrap(value), k(collection, key)))
}

export async function idbDelete(collection, key) {
  mem.delete(k(collection, key))
  const db = await open()
  if (db) await run(db, 'readwrite', (s) => s.delete(k(collection, key)))
}

/** Returns [{ key, value }] for a collection. */
export async function idbList(collection) {
  const prefix = collection + '/'
  const db = await open()
  if (!db) {
    return [...mem.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, e]) => ({ key: key.slice(prefix.length), value: unwrap(e) }))
  }
  const range = IDBKeyRange.bound(prefix, prefix + '￿')
  const keys = (await run(db, 'readonly', (s) => s.getAllKeys(range))) || []
  const vals = (await run(db, 'readonly', (s) => s.getAll(range))) || []
  return keys
    .map((key, i) => ({ key: String(key).slice(prefix.length), value: unwrap(vals[i]) }))
    .filter((x) => x.value !== undefined)
}

export async function idbClearAll() {
  mem.clear()
  const db = await open()
  if (db) await run(db, 'readwrite', (s) => s.clear())
}

export async function idbCount() {
  const db = await open()
  if (!db) return mem.size
  return (await run(db, 'readonly', (s) => s.count())) ?? 0
}
