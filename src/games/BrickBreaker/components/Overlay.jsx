import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/** Full-size screen over the game. Scrolls on small displays and focuses its main action. */
export default function Overlay({ label, children, focusDelay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    // A short delay on result screens stops a held Space key from pressing a button by accident.
    const focus = () => ref.current?.querySelector('[data-autofocus]')?.focus({ preventScroll: true })
    if (!focusDelay) {
      focus()
      return undefined
    }
    ref.current?.focus({ preventScroll: true })
    const id = setTimeout(focus, focusDelay)
    return () => clearTimeout(id)
  }, [focusDelay])

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-10 overflow-y-auto overscroll-contain rounded-xl bg-[#03040f]/80 backdrop-blur-sm focus-visible:!outline-none"
    >
      <div className="flex min-h-full p-3">
        <motion.div initial={{ y: 16, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="card m-auto w-full max-w-lg !border-violet-400/30 p-4 text-center sm:p-6">
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}
