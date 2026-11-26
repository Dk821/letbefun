// Synthesised sound effects (no audio files). Follows the global sound setting.
import { soundStore } from '../../../services/storage/index.js'

export function createAudio() {
  let ctx = null
  let noise = null
  const last = {}

  /** Must be called from a click or key press: browsers block audio before that. */
  function unlock() {
    if (!soundStore.get()) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      if (!ctx) {
        ctx = new AC()
        noise = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate)
        const data = noise.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    } catch {
      ctx = null
    }
  }

  function envelope(volume, start, length) {
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
    gain.connect(ctx.destination)
    return gain
  }

  function tone(type, from, to, length, volume, delay = 0) {
    const t = ctx.currentTime + delay
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(from, t)
    o.frequency.exponentialRampToValueAtTime(to, t + length)
    o.connect(envelope(volume, t, length))
    o.start(t)
    o.stop(t + length)
  }

  function rumble(length, cutoff, volume) {
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    src.buffer = noise
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(cutoff, t)
    filter.frequency.exponentialRampToValueAtTime(80, t + length)
    src.connect(filter).connect(envelope(volume, t, length))
    src.start(t)
    src.stop(t + length)
  }

  // [minimum seconds between plays, sound]
  const SOUNDS = {
    laser: [0.09, () => tone('square', 880, 220, 0.09, 0.025)],
    hit: [0.07, () => tone('triangle', 320, 180, 0.05, 0.03)],
    pop: [0.1, () => rumble(0.18, 2400, 0.08)],
    explosion: [0.08, () => rumble(0.4, 1400, 0.16)],
    damage: [0.15, () => { tone('sawtooth', 220, 55, 0.3, 0.1); rumble(0.2, 700, 0.12) }],
    powerup: [0.1, () => [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.1, 0.07, i * 0.06))],
    boss: [1, () => [0, 0.35, 0.7].forEach((d) => tone('sawtooth', 330, 110, 0.3, 0.09, d))],
    over: [1, () => [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.97, 0.26, 0.09, i * 0.2))],
    victory: [1, () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.18, 0.09, i * 0.13))],
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
