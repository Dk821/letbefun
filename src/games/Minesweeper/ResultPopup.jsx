import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Eye, RotateCcw } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'

/** Shown when a game ends. Escape or "View board" closes it without restarting. */
export default function ResultPopup({ won, record, time, best, onRestart, onClose }) {
  const box = useRef(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    // Capture phase, so Escape closes this popup before the page's "close game" shortcut sees it.
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close.current()
      } else if (e.key === 'Tab') {
        // Keep keyboard focus inside the popup.
        const buttons = [...box.current.querySelectorAll('button')]
        const next = buttons.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1)
        e.preventDefault()
        buttons[(next + buttons.length) % buttons.length].focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mines-result"
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="card w-full max-w-xs p-6 text-center"
      >
        <p className="text-5xl" aria-hidden>{won ? '🎉' : '💥'}</p>
        <h2 id="mines-result" className="mt-2 text-3xl font-black">{won ? 'You win!' : 'Game over'}</h2>
        <p className="mt-1 text-sm text-muted">
          {record ? '🏆 New best time!' : won ? 'Every safe square is open.' : 'You hit a mine.'}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <Stat label="Time" value={`${time}s`} />
          <Stat label="Best" value={best != null ? `${best}s` : '—'} />
        </div>
        {/* Bright green so the main action stands out; the page's own accent for this game is grey. */}
        <motion.button
          type="button"
          className="btn btn-primary mt-5 w-full !py-3 !text-base font-bold"
          style={{ '--game': '#22c55e' }}
          animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.7)', '0 0 0 10px rgba(34,197,94,0)'] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          onClick={onRestart}
          autoFocus
        >
          <RotateCcw size={18} aria-hidden /> Play again
        </motion.button>
        <button type="button" className="btn mt-2 w-full" onClick={onClose}>
          <Eye size={16} aria-hidden /> View board
        </button>
      </motion.div>
    </motion.div>
  )
}
