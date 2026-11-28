import { motion } from 'framer-motion'
import { ArrowRight, Menu, RotateCcw, Star } from 'lucide-react'
import { Stat } from '../../../components/ui.jsx'
import { LEVELS } from '../data/levels.js'
import Overlay from './Overlay.jsx'

export default function LevelComplete({ result, onNext, onReplay, onMenu }) {
  return (
    <Overlay label="Level complete" focusDelay={600}>
      <div className="flex justify-center gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span key={i} initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 + i * 0.15, type: 'spring' }}>
            <Star size={i === 1 ? 44 : 32} className="fill-yellow-300 text-yellow-300 drop-shadow-[0_0_10px_#fbbf24]" />
          </motion.span>
        ))}
      </div>
      <h2 className="mt-2 text-3xl font-black tracking-widest text-emerald-300">LEVEL COMPLETE</h2>
      <p className="mt-1 text-sm text-muted">Level {result.level} of {LEVELS.length}: {result.name}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-left">
        <Stat label="Score earned" value={result.score.toLocaleString()} />
        <Stat label="Time taken" value={`${Math.floor(result.time)}s`} />
        <Stat label="Bricks destroyed" value={result.bricks} />
      </div>
      <p className="mt-3 text-sm text-muted">
        Total <strong className="font-mono text-ink">{result.total.toLocaleString()}</strong> · includes a {result.bonus.toLocaleString()} clear bonus
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={onNext} data-autofocus>Next level <ArrowRight size={16} aria-hidden /></button>
        <button type="button" className="btn" onClick={onReplay}><RotateCcw size={16} aria-hidden /> Replay</button>
        <button type="button" className="btn btn-ghost" onClick={onMenu}><Menu size={16} aria-hidden /> Main menu</button>
      </div>
    </Overlay>
  )
}
