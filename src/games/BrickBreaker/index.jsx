import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameData, useSound } from '../../hooks/index.js'
import GameCanvas from './components/GameCanvas.jsx'
import GameHUD from './components/GameHUD.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'
import LevelComplete from './components/LevelComplete.jsx'
import PauseScreen from './components/PauseScreen.jsx'
import StartScreen from './components/StartScreen.jsx'
import TouchControls from './components/TouchControls.jsx'
import { CONTROL_METHODS, DIFFICULTIES, SLUG } from './data/constants.js'
import { createAudio } from './engine/audio.js'
import { createEngine, createInput } from './engine/gameEngine.js'

const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'fireKey' }
const MODE = 'classic' // the only mode offered to players
const NO_STATS = { played: 0, highestLevel: 0, bricks: 0, powerups: 0, time: 0 }
const isNumberMap = (v) => Boolean(v) && typeof v === 'object' && Object.values(v).every((n) => typeof n === 'number')
const isStats = (v) => isNumberMap(v) && Object.keys(NO_STATS).every((k) => k in v)
const oneOf = (options) => (v) => typeof v === 'string' && Object.hasOwn(options, v)

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

export default function BrickBreaker({ onExit }) {
  const [bests, setBests, bestsStore] = useGameData(SLUG, 'bests', {}, isNumberMap)
  const [stats, setStats] = useGameData(SLUG, 'stats', NO_STATS, isStats)
  const [difficulty, setDifficulty] = useGameData(SLUG, 'difficulty', 'normal', oneOf(DIFFICULTIES))
  const [control, setControl] = useGameData(SLUG, 'control', 'follow', oneOf(CONTROL_METHODS))

  const [status, setStatus] = useState('menu') // menu | playing | paused | complete | over
  const [hud, setHud] = useState(null)
  const [levelResult, setLevelResult] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [run, setRun] = useState(0)
  const click = useSound()
  const touch = useTouchDevice()
  const root = useRef(null)
  const runBest = useRef(0) // best score when this run began, to detect a new record
  const handlers = useRef({})

  const [{ engine, audio }] = useState(() => {
    const sound = createAudio()
    return {
      audio: sound,
      engine: createEngine({
        onSound: sound.play,
        onEvent: (event) => handlers.current.event(event),
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }),
    }
  })

  /** Saves everything that happened since the last save. Safe to call at any time. */
  const commit = useCallback(() => {
    const p = engine.takeProgress()
    if (!p) return
    setBests((b) => (p.score > (b[p.mode] ?? 0) ? { ...b, [p.mode]: p.score } : b))
    setStats((s) => ({
      ...s,
      bricks: s.bricks + p.bricks,
      powerups: s.powerups + p.powerups,
      time: Math.round((s.time + p.time) * 10) / 10,
      highestLevel: p.mode === 'classic' ? Math.max(s.highestLevel, p.level) : s.highestLevel,
    }))
  }, [engine, setBests, setStats])

  const releaseInput = () => Object.assign(engine.input, createInput())

  /** Shows the field again after a menu or modal. */
  const play = () => {
    audio.unlock()
    releaseInput()
    setHud(engine.hud())
    setRun((n) => n + 1)
    setStatus('playing')
  }
  const start = () => {
    commit()
    runBest.current = bestsStore.get()[MODE] ?? 0
    audio.unlock() // before engine.start, so it happens inside the click
    engine.start(MODE, difficulty)
    setStats((s) => ({ ...s, played: s.played + 1 }))
    commit()
    play()
  }
  const nextLevel = () => {
    engine.nextLevel()
    commit()
    play()
  }
  const restartLevel = () => {
    commit()
    engine.replayLevel()
    play()
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
    setHud(null)
    setStatus('menu')
  }
  const exit = () => {
    commit()
    if (onExit) onExit()
    else toMenu()
  }
  const onEvent = (event) => {
    commit()
    releaseInput()
    setHud(engine.hud())
    if (event.type === 'levelComplete') {
      setLevelResult(event)
      setStatus('complete')
    } else {
      setOutcome({ ...event, isRecord: event.score > runBest.current })
      setStatus('over')
    }
  }
  handlers.current = { status, start, pause, resume, event: onEvent }

  const choose = (setter) => (value) => {
    click('tick')
    setter(value)
  }

  // Keyboard. Capture phase, so Escape pauses the game before the page's "close game" shortcut sees it.
  useEffect(() => {
    const ours = (e) => e.target === document.body || root.current?.contains(e.target)
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const { status: now } = handlers.current
      if (e.key === 'Escape') {
        if (now === 'menu') return
        e.preventDefault()
        e.stopPropagation()
        if (!e.repeat && (now === 'playing' || now === 'paused')) handlers.current[now === 'playing' ? 'pause' : 'resume']()
        return
      }
      if (!ours(e)) return
      const action = KEYS[e.code]
      if (now === 'playing' && action) {
        e.preventDefault()
        engine.input[action] = true
        if (action === 'fireKey' && !e.repeat) engine.input.launch = true
      } else if (e.repeat && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault()
      } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && (now === 'menu' || now === 'over')) {
        e.preventDefault()
        handlers.current.start()
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
    const onHidden = () => {
      if (!document.hidden) return
      pause()
      commit()
    }
    const onOutside = (e) => !root.current?.contains(e.target) && pause()
    document.addEventListener('visibilitychange', onHidden)
    document.addEventListener('pointerdown', onOutside)
    window.addEventListener('blur', pause)
    window.addEventListener('pagehide', commit)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      document.removeEventListener('pointerdown', onOutside)
      window.removeEventListener('blur', pause)
      window.removeEventListener('pagehide', commit)
      commit()
      audio.close()
    }
  }, [audio, commit, pause])

  useEffect(() => {
    if (status === 'playing') root.current?.focus({ preventScroll: true })
    else if (status === 'paused') {
      releaseInput()
      commit()
      audio.suspend()
    }
  }, [status, run]) // eslint-disable-line react-hooks/exhaustive-deps

  const playing = status === 'playing'
  const best = bests[MODE] ?? 0

  return (
    <div
      ref={root}
      tabIndex={-1}
      className={`dark relative flex h-full min-h-[20rem] w-full flex-col bg-[#050714] text-ink focus-visible:!outline-none short:min-h-[14rem] ${playing ? 'no-select touch-none overscroll-none' : ''}`}
      style={{ '--game': '#22d3ee' }}
      onContextMenu={(e) => playing && e.preventDefault()}
    >
      {status !== 'menu' && hud && <GameHUD hud={hud} best={best} onPause={pause} />}
      <GameCanvas engine={engine} paused={status === 'paused'} playing={playing} control={control} onHud={setHud} />
      {/* Stays mounted while paused so the game field does not resize. */}
      {status !== 'menu' && touch && <TouchControls key={status} input={engine.input} arrows={control === 'buttons'} laser={Boolean(hud?.laser)} />}

      {status === 'menu' && (
        <StartScreen
          difficulty={difficulty}
          control={control}
          best={best}
          stats={stats}
          onDifficulty={choose(setDifficulty)}
          onControl={choose(setControl)}
          onPlay={start}
        />
      )}
      {status === 'paused' && <PauseScreen mode={engine.state.mode} onResume={resume} onRestartLevel={restartLevel} onRestart={start} onExit={exit} />}
      {status === 'complete' && levelResult && <LevelComplete result={levelResult} onNext={nextLevel} onReplay={restartLevel} onMenu={toMenu} />}
      {status === 'over' && outcome && (
        <GameOverScreen result={outcome} best={bests[outcome.mode] ?? 0} isRecord={outcome.isRecord} onRestart={start} onMenu={toMenu} onExit={exit} />
      )}
    </div>
  )
}
