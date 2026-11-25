import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gameStore, soundStore, useStore } from '../services/storage/index.js'
import { idbList, idbSet, idbDelete } from '../services/storage/idb.js'

/** Persistent per-game value backed by LocalStorage (shared across components). */
export function useGameData(slug, name, initial, validate) {
  const store = useMemo(() => gameStore(slug, name, initial, validate), [slug, name]) // eslint-disable-line react-hooks/exhaustive-deps
  const value = useStore(store)
  return [value, store.set, store]
}

/** Best-score helper. `better` is 'high' | 'low'. */
export function useBestScore(slug, name = 'best', better = 'high') {
  const [best, setBest] = useGameData(slug, name, null, (v) => v === null || typeof v === 'number')
  const submit = useCallback(
    (score) => {
      let isNew = false
      setBest((prev) => {
        if (prev == null || (better === 'high' ? score > prev : score < prev)) {
          isNew = true
          return score
        }
        return prev
      })
      return isNew
    },
    [setBest, better],
  )
  return [best, submit]
}

/** setInterval that always calls the latest callback and cleans up. */
export function useInterval(cb, ms, active = true) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!active || ms == null) return undefined
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [ms, active])
}

/** Stopwatch with start/pause/reset. Returns elapsed ms (updated every `tick`). */
export function useStopwatch(tick = 100) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const base = useRef(0)
  const startAt = useRef(0)
  useEffect(() => {
    if (!running) return undefined
    startAt.current = performance.now()
    const id = setInterval(() => setElapsed(base.current + performance.now() - startAt.current), tick)
    return () => {
      clearInterval(id)
      base.current += performance.now() - startAt.current
    }
  }, [running, tick])
  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    base.current = 0
    setElapsed(0)
  }, [])
  return { elapsed, running, start, pause, reset }
}

/** Countdown in whole seconds. */
export function useCountdown(seconds, onDone) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(false)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (!running) return undefined
    const end = performance.now() + left * 1000
    const id = setInterval(() => {
      const l = Math.max(0, (end - performance.now()) / 1000)
      setLeft(l)
      if (l <= 0) {
        clearInterval(id)
        setRunning(false)
        done.current?.()
      }
    }, 100)
    return () => clearInterval(id)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps
  return {
    left,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false)
      setLeft(seconds)
    },
  }
}

/** Tiny WebAudio synth — no audio files needed, respects the sound setting. */
let audioCtx
export function useSound() {
  const enabled = useStore(soundStore)
  return useCallback(
    (type = 'pop') => {
      if (!enabled) return
      try {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return
        audioCtx = audioCtx || new AC()
        if (audioCtx.state === 'suspended') audioCtx.resume()
        const presets = {
          pop: [520, 0.06, 'sine'],
          good: [740, 0.12, 'triangle'],
          bad: [160, 0.18, 'sawtooth'],
          win: [980, 0.25, 'triangle'],
          tick: [880, 0.03, 'square'],
        }
        const [f, d, w] = presets[type] || presets.pop
        const o = audioCtx.createOscillator()
        const g = audioCtx.createGain()
        o.type = w
        o.frequency.value = f
        g.gain.setValueAtTime(0.08, audioCtx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + d)
        o.connect(g).connect(audioCtx.destination)
        o.start()
        o.stop(audioCtx.currentTime + d)
      } catch {
        /* audio unavailable */
      }
    },
    [enabled],
  )
}

/** IndexedDB-backed collection (user-created data, larger saves). */
export function useIdbCollection(collection) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    idbList(collection).then((list) => {
      if (!alive.current) return
      setItems(list)
      setReady(true)
    })
    return () => {
      alive.current = false
    }
  }, [collection])
  const put = useCallback(
    async (key, value) => {
      await idbSet(collection, key, value)
      setItems((prev) => [...prev.filter((x) => x.key !== key), { key, value }])
    },
    [collection],
  )
  const remove = useCallback(
    async (key) => {
      await idbDelete(collection, key)
      setItems((prev) => prev.filter((x) => x.key !== key))
    },
    [collection],
  )
  return { items, ready, put, remove }
}

/** Per-page SEO: title, description, canonical and Open Graph tags. */
const SITE = 'https://letbe.fun'
export function useSeo({ title, description, path = '/' }) {
  useEffect(() => {
    const full = title ? `${title} — letbe.fun` : 'letbe.fun — tiny games and curious experiments'
    document.title = full
    const set = (sel, attr, val, create) => {
      let el = document.head.querySelector(sel)
      if (!el) {
        el = document.createElement(create.tag)
        Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v))
        document.head.appendChild(el)
      }
      el.setAttribute(attr, val)
    }
    const url = SITE + path
    set('meta[name="description"]', 'content', description, { tag: 'meta', attrs: { name: 'description' } })
    set('link[rel="canonical"]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } })
    set('meta[property="og:title"]', 'content', full, { tag: 'meta', attrs: { property: 'og:title' } })
    set('meta[property="og:description"]', 'content', description, { tag: 'meta', attrs: { property: 'og:description' } })
    set('meta[property="og:url"]', 'content', url, { tag: 'meta', attrs: { property: 'og:url' } })
    set('meta[property="og:image"]', 'content', SITE + '/images/og.png', { tag: 'meta', attrs: { property: 'og:image' } })
    set('meta[name="twitter:card"]', 'content', 'summary_large_image', { tag: 'meta', attrs: { name: 'twitter:card' } })
    set('meta[name="twitter:title"]', 'content', full, { tag: 'meta', attrs: { name: 'twitter:title' } })
    set('meta[name="twitter:description"]', 'content', description, { tag: 'meta', attrs: { name: 'twitter:description' } })
    set('meta[name="twitter:image"]', 'content', SITE + '/images/og.png', { tag: 'meta', attrs: { name: 'twitter:image' } })
  }, [title, description, path])
}

export function useKey(handler, deps = []) {
  useEffect(() => {
    const f = (e) => handler(e)
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
