import { BUILTIN, keyOf } from './recipes.js'

/** Combine two element names using built-in + user recipes. Returns { name, emoji } or null. */
export function combine(a, b, custom = new Map()) {
  const k = keyOf(a, b)
  return custom.get(k) || BUILTIN.get(k) || null
}
