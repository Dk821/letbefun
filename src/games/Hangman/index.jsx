import { useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useGameData, useKey, useSound } from '../../hooks/index.js'

const WORDS = ['planet', 'rocket', 'garden', 'puzzle', 'jungle', 'island', 'castle', 'dragon', 'wizard', 'pirate', 'volcano', 'penguin', 'compass', 'harvest', 'lantern', 'thunder', 'mystery', 'monster', 'diamond', 'journey', 'whisper', 'blanket', 'giraffe', 'orchestra', 'adventure', 'telescope', 'butterfly', 'chocolate', 'mountain', 'keyboard']
const LIVES = 6
const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)]
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

export default function Hangman() {
  const [word, setWord] = useState(pick)
  const [guessed, setGuessed] = useState([])
  const [stats, setStats] = useGameData('hangman', 'stats', { w: 0, l: 0 }, (v) => v && typeof v.w === 'number')
  const play = useSound()
  const wrong = guessed.filter((c) => !word.includes(c))
  const won = word.split('').every((c) => guessed.includes(c))
  const lost = wrong.length >= LIVES
  const over = won || lost

  const guess = (c) => {
    if (over || guessed.includes(c)) return
    const g = [...guessed, c]
    setGuessed(g)
    const nowWon = word.split('').every((x) => g.includes(x))
    const nowLost = g.filter((x) => !word.includes(x)).length >= LIVES
    if (nowWon) { setStats((s) => ({ ...s, w: s.w + 1 })); play('win') }
    else if (nowLost) { setStats((s) => ({ ...s, l: s.l + 1 })); play('bad') }
    else play(word.includes(c) ? 'good' : 'tick')
  }
  useKey((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const c = e.key.toLowerCase()
    if (c.length === 1 && LETTERS.includes(c)) guess(c)
  }, [guessed, word])
  const again = () => { setWord(pick()); setGuessed([]) }

  const parts = [
    <circle key="h" cx="150" cy="70" r="16" />,
    <line key="b" x1="150" y1="86" x2="150" y2="140" />,
    <line key="la" x1="150" y1="100" x2="128" y2="124" />,
    <line key="ra" x1="150" y1="100" x2="172" y2="124" />,
    <line key="ll" x1="150" y1="140" x2="130" y2="174" />,
    <line key="rl" x1="150" y1="140" x2="170" y2="174" />,
  ]

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Lives" value={'❤️'.repeat(LIVES - wrong.length) || '💀'} />
        <Stat label="Wins" value={stats.w} />
        <Stat label="Losses" value={stats.l} />
      </div>
      <svg viewBox="0 0 220 200" className="mx-auto h-48 w-full max-w-[16rem]" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" aria-hidden>
        <line x1="30" y1="190" x2="190" y2="190" /><line x1="60" y1="190" x2="60" y2="20" /><line x1="60" y1="20" x2="150" y2="20" /><line x1="150" y1="20" x2="150" y2="54" />
        <g stroke="var(--game)">{parts.slice(0, wrong.length)}</g>
      </svg>
      <p className="my-4 text-center font-mono text-4xl font-bold tracking-[0.3em]" aria-label="word">
        {word.split('').map((c) => (guessed.includes(c) || lost ? c : '_')).join(' ')}
      </p>
      <p className="mb-3 text-center font-display text-xl font-bold" aria-live="polite">{won ? '🎉 You got it!' : lost ? 'Out of lives' : ''}</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {LETTERS.map((c) => {
          const used = guessed.includes(c)
          return (
            <button key={c} disabled={used || over} onClick={() => guess(c)} className="btn !min-h-10 !w-10 !p-0 uppercase"
              style={used ? { background: word.includes(c) ? '#bbf7d0' : '#fecaca', color: '#111' } : undefined}>{c}</button>
          )
        })}
      </div>
      {over && <div className="mt-4 text-center"><button className="btn btn-primary" onClick={again}>Next word</button></div>}
    </div>
  )
}
