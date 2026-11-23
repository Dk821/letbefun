import { useEffect, useMemo, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useCountdown } from '../../hooks/index.js'

const WORDS = 'the quick brown fox jumps over a lazy dog while seven tiny robots build a lighthouse near the quiet river and every morning the wind carries stories from distant mountains across empty fields where old trains rest beneath wide skies we gather small stones paint them blue and line them along the window to remember how bright the summer was people say patience is a skill but it feels more like a habit grown slowly like moss on a wall keep typing and let your fingers find the rhythm without looking down'.split(' ')

const makeText = () => {
  const out = []
  for (let i = 0; i < 90; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  return out.join(' ')
}

export default function TypingTest() {
  const [duration, setDuration] = useState(30)
  const [text, setText] = useState(makeText)
  const [typed, setTyped] = useState('')
  const [finished, setFinished] = useState(false)
  const [best, submitBest] = useBestScore('typing-test', 'bestWpm', 'high')
  const input = useRef(null)
  const cd = useCountdown(duration, () => setFinished(true))

  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    if (finished) submitBest(stats.wpm)
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    let correct = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++
    const elapsed = Math.max(1, duration - cd.left)
    return {
      correct,
      wpm: Math.round(correct / 5 / (elapsed / 60)),
      acc: typed.length ? Math.round((correct / typed.length) * 100) : 100,
    }
  }, [typed, text, duration, cd.left])

  function onChange(e) {
    if (finished) return
    const v = e.target.value.slice(0, text.length)
    if (!cd.running && v.length) cd.start()
    setTyped(v)
    if (v.length >= text.length) {
      cd.pause()
      setFinished(true)
    }
  }

  function restart(d = duration) {
    setDuration(d)
    setText(makeText())
    setTyped('')
    setFinished(false)
    cd.reset()
    setTimeout(() => input.current?.focus(), 0)
  }
  // keep countdown length in sync when duration changes
  useEffect(() => {
    cd.reset()
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  const chars = text.split('')
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[15, 30, 60].map((d) => (
          <button key={d} className="chip" aria-pressed={duration === d} onClick={() => restart(d)}>{d}s</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Time" value={`${Math.ceil(cd.left)}s`} />
        <Stat label="WPM" value={stats.wpm} />
        <Stat label="Accuracy" value={`${stats.acc}%`} />
        <Stat label="Best WPM" value={best ?? '—'} />
      </div>
      <div
        className="card relative mt-4 cursor-text select-none p-5 font-mono text-lg leading-8 sm:text-xl"
        onClick={() => input.current?.focus()}
        aria-hidden
        style={{ maxHeight: '14rem', overflow: 'hidden' }}
      >
        {chars.map((ch, i) => {
          const state = i >= typed.length ? 'pending' : typed[i] === ch ? 'ok' : 'bad'
          return (
            <span
              key={i}
              className={state === 'ok' ? 'text-[#16a34a]' : state === 'bad' ? 'rounded bg-[#ef4444]/25 text-[#ef4444]' : 'text-muted'}
              style={i === typed.length ? { borderLeft: '2px solid var(--game)' } : undefined}
            >
              {ch}
            </span>
          )
        })}
      </div>
      <label>
        <span className="sr-only">Type the passage here</span>
        <textarea
          ref={input}
          value={typed}
          onChange={onChange}
          disabled={finished}
          rows={2}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="field mt-3 font-mono"
          placeholder="Start typing here…"
          onPaste={(e) => e.preventDefault()}
        />
      </label>
      <div aria-live="polite" className="mt-4">
        {finished && (
          <div className="card p-5">
            <p className="font-display text-2xl font-bold">{stats.wpm} WPM · {stats.acc}% accuracy</p>
            <p className="text-sm text-muted">{stats.correct} correct characters in {duration} seconds{stats.wpm >= (best ?? 0) ? ' — a new personal best!' : '.'}</p>
            <button className="btn btn-primary mt-3" onClick={() => restart()}>Try again</button>
          </div>
        )}
      </div>
    </div>
  )
}
