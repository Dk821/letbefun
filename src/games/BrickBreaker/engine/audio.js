// Synthesised sound effects (no audio files). Follows the global sound setting.
// The shared useSound hook has five presets; gameplay needs more distinct sounds than that.
import { soundStore } from '../../../services/storage/index.js'

export function createAudio() {
  let ctx = null
  const last = {}

  /** Must be called from a click, tap or key press: browsers block audio before that. */
  function unlock() {
    if (!soundStore.get()) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      ctx ||= new AC()
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    } catch {
      ctx = null
    }
  }

  function tone(type, from, to, length, volume, delay = 0) {
    const t = ctx.currentTime + delay
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(from, t)
    o.frequency.exponentialRampToValueAtTime(to, t + length)
    g.gain.setValueAtTime(volume, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + length)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + length)
  }

  const notes = (list, gap, length, volume = 0.08) => list.forEach((f, i) => tone('triangle', f, f, length, volume, i * gap))

  // [minimum seconds between plays, sound]
  const SOUNDS = {
    launch: [0.1, () => tone('triangle', 260, 620, 0.12, 0.06)],
    paddle: [0.05, () => tone('sine', 240, 360, 0.08, 0.09)],
    brick: [0.04, () => tone('square', 440, 330, 0.05, 0.025)],
    break: [0.04, () => tone('triangle', 720, 280, 0.09, 0.06)],
    explode: [0.1, () => { tone('sawtooth', 180, 40, 0.35, 0.1); tone('square', 90, 35, 0.25, 0.06) }],
    power: [0.1, () => notes([523, 659, 784, 1047], 0.055, 0.1, 0.07)],
    bad: [0.1, () => tone('sawtooth', 300, 120, 0.2, 0.06)],
    laser: [0.12, () => tone('square', 960, 240, 0.08, 0.022)],
    life: [0.2, () => notes([659, 880, 1319], 0.09, 0.16)],
    shield: [0.1, () => tone('sine', 880, 1500, 0.18, 0.08)],
    lose: [0.3, () => tone('sawtooth', 260, 60, 0.35, 0.08)],
    level: [1, () => notes([523, 659, 784, 659, 784, 1047], 0.11, 0.17)],
    over: [1, () => notes([392, 330, 262, 196], 0.19, 0.25)],
  }

  return {
    unlock,
    play(name) {
      if (!ctx || ctx.state !== 'running' || !soundStore.get()) return
      const [gap, sound] = SOUNDS[name]
      if (ctx.currentTime - (last[name] ?? -9) < gap) return
      last[name] = ctx.currentTime
      sound()
    },
    suspend() {
      ctx?.suspend().catch(() => {})
    },
    close() {
      ctx?.close().catch(() => {})
      ctx = null
    },
  }
}
