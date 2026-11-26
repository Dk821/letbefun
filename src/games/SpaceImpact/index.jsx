import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameData } from '../../hooks/index.js'
import BossHealthBar from './components/BossHealthBar.jsx'
import GameCanvas from './components/GameCanvas.jsx'
import GameHUD from './components/GameHUD.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'
import MobileControls from './components/MobileControls.jsx'
import PauseScreen from './components/PauseScreen.jsx'
import StartScreen from './components/StartScreen.jsx'
import { DIFFICULTIES, SLUG } from './data/constants.js'
import { createAudio } from './engine/audio.js'
import { createEngine, createInput } from './engine/gameEngine.js'

const KEYS = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'fire',
}
const MODE = 'classic' // the only mode offered to players
const NO_STATS = { played: 0, destroyed: 0, bestTime: 0, bosses: 0 }
const isNumberMap = (v) => Boolean(v) && typeof v === 'object' && Object.values(v).every((n) => typeof n === 'number')
const isStats = (v) => isNumberMap(v) && Object.keys(NO_STATS).every((k) => k in v)

function useTouchDevice() {
  const [touch, setTouch] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    // Hybrid devices: show the controls as soon as the screen is touched.
    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])
  return touch
}

export default function SpaceImpact({ onExit }) {
  const [bests, setBests] = useGameData(SLUG, 'bests', {}, isNumberMap)
  const [stats, setStats] = useGameData(SLUG, 'stats', NO_STATS, isStats)
  const [difficulty, setDifficulty] = useGameData(SLUG, 'difficulty', 'normal', (v) => Object.hasOwn(DIFFICULTIES, v))

  const [status, setStatus] = useState('menu') // menu | playing | paused | over
  const [outcome, setOutcome] = useState(null)
  const [hud, setHud] = useState(null)
  const [run, setRun] = useState(0)
  const touch = useTouchDevice()
  const root = useRef(null)
  const handlers = useRef({})

  const [{ engine, audio }] = useState(() => {
    const sound = createAudio()
    return {
      audio: sound,
      engine: createEngine({
        onSound: sound.play,
        onEnd: (result) => handlers.current.end(result),
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }),
    }
  })

  /** Saves the current run once: on game over, restart, quit or when leaving the page. */
  const commit = () => {
    const r = engine.takeResult()
    if (!r) return null
    const isRecord = r.score > (bests[r.mode] ?? 0)
    if (isRecord) setBests((b) => ({ ...b, [r.mode]: r.score }))
    setStats((s) => ({
      ...s,
      destroyed: s.destroyed + r.kills,
      bosses: s.bosses + r.bosses,
      bestTime: Math.max(s.bestTime, Math.round(r.time * 10) / 10),
    }))
    return { ...r, isRecord }
  }

  const releaseInput = () => Object.assign(engine.input, createInput())

  const start = () => {
    commit()
    audio.unlock()
    releaseInput()
    engine.start(MODE, difficulty)
    setStats((s) => ({ ...s, played: s.played + 1 }))
    setHud(engine.hud())
    setOutcome(null)
    setRun((n) => n + 1)
    setStatus('playing')
  }
  const pause = useCallback(() => setStatus((s) => (s === 'playing' ? 'paused' : s)), [])
  const resume = () => {
    audio.unlock()
    releaseInput()
    setStatus('playing')
  }
  const toMenu = () => {
    commit()
    engine.stop()
    setStatus('menu')
  }
  const exit = () => {
    commit()
    if (onExit) onExit()
    else toMenu()
  }
  const end = (result) => {
    const saved = commit() ?? { ...result, isRecord: false }
    releaseInput()
    audio.play(result.victory ? 'victory' : 'over')
    setHud(engine.hud())
    setOutcome(saved)
    setStatus('over')
  }
  handlers.current = { status, start, pause, resume, commit, end }

  // Keyboard. Capture phase, so Escape pauses the game before the page's "close game" shortcut sees it.
  useEffect(() => {
    const ours = (e) => e.target === document.body || root.current?.contains(e.target)
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const { status: now } = handlers.current
      const action = KEYS[e.code]
      if (e.key === 'Escape') {
        if (now !== 'playing' && now !== 'paused') return
        e.preventDefault()
        e.stopPropagation()
        if (!e.repeat) handlers.current[now === 'playing' ? 'pause' : 'resume']()
        return
      }
      if (!ours(e)) return
      if (now === 'playing' && action) {
        e.preventDefault()
        engine.input[action] = true
      } else if (e.key === 'Enter' || e.code === 'Space') {
        if (e.repeat) e.preventDefault()
        // A focused button handles Enter itself.
        else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && (now === 'menu' || now === 'over')) {
          e.preventDefault()
          handlers.current.start()
        }
      }
    }
    const onKeyUp = (e) => {
      const action = KEYS[e.code]
      if (!action) return
      engine.input[action] = false
      if (handlers.current.status === 'playing' && ours(e)) e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
    }
  }, [engine])

  // Pause when the tab is hidden, the window loses focus, or the player uses the page around the game.
  useEffect(() => {
    const onHidden = () => document.hidden && pause()
    const onOutside = (e) => !root.current?.contains(e.target) && pause()
    const onLeave = () => handlers.current.commit()
    document.addEventListener('visibilitychange', onHidden)
    document.addEventListener('pointerdown', onOutside)
    window.addEventListener('blur', pause)
    window.addEventListener('pagehide', onLeave)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      document.removeEventListener('pointerdown', onOutside)
      window.removeEventListener('blur', pause)
      window.removeEventListener('pagehide', onLeave)
      onLeave()
      audio.close()
    }
  }, [audio, pause])

  useEffect(() => {
    if (status === 'playing') root.current?.focus({ preventScroll: true })
    else if (status === 'paused') {
      releaseInput()
      audio.suspend()
    }
  }, [status, run]) // eslint-disable-line react-hooks/exhaustive-deps

  const active = status === 'playing' || status === 'paused'
  const best = bests[MODE] ?? 0

  return (
    <div
      ref={root}
      tabIndex={-1}
      className={`dark relative flex h-full min-h-[18rem] w-full flex-col bg-[#050714] text-ink focus-visible:!outline-none ${status === 'playing' ? 'no-select touch-none' : ''}`}
      style={{ '--game': '#22d3ee' }}
      onContextMenu={(e) => status === 'playing' && e.preventDefault()}
    >
      {active && hud && <GameHUD hud={hud} best={best} mode={MODE} onPause={pause} />}
      <GameCanvas engine={engine} paused={status === 'paused'} onHud={setHud}>
        {active && hud?.boss && <BossHealthBar boss={hud.boss} />}
      </GameCanvas>
      {/* Stays mounted while paused so the game field does not resize. */}
      {active && touch && <MobileControls key={status} input={engine.input} />}

      {status === 'menu' && (
        <StartScreen difficulty={difficulty} best={best} stats={stats} onDifficulty={setDifficulty} onPlay={start} />
      )}
      {status === 'paused' && <PauseScreen onResume={resume} onRestart={start} onExit={exit} />}
      {status === 'over' && outcome && (
        <GameOverScreen result={outcome} best={bests[outcome.mode] ?? 0} isRecord={outcome.isRecord} onRestart={start} onMenu={toMenu} onExit={exit} />
      )}
    </div>
  )
}
