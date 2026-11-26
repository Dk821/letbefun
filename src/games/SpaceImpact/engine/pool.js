/** Fixed-size object pool: nothing is allocated while the game is running. */
export function createPool(size, shape) {
  const items = Array.from({ length: size }, () => ({ ...shape, active: false }))
  let cursor = 0
  return {
    items,
    /** Returns a reset, active item, or null when the pool is full. */
    spawn(props) {
      for (let i = 0; i < size; i++) {
        const item = items[(cursor + i) % size]
        if (item.active) continue
        cursor = (cursor + i + 1) % size
        return Object.assign(item, shape, props, { active: true })
      }
      return null
    },
    clear() {
      for (const item of items) item.active = false
    },
  }
}

/** Removes `dead` entries from an array in place. */
export function compact(list) {
  let n = 0
  for (let i = 0; i < list.length; i++) if (!list[i].dead) list[n++] = list[i]
  list.length = n
}

export const rand = (min, max) => min + Math.random() * (max - min)
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
