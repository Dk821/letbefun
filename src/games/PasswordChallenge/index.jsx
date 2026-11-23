import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useBestScore } from '../../hooks/index.js'
import { RULES } from './rules.js'

export default function PasswordChallenge() {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [best, submitBest] = useBestScore('password-challenge', 'bestRules', 'high')
  const year = new Date().getFullYear()

  // Reveal rules one by one: show all satisfied rules + the first failing one.
  const { visible, allPassed } = useMemo(() => {
    const results = RULES.map((r) => r.test(pw, { year }))
    const firstFail = results.indexOf(false)
    const count = firstFail === -1 ? RULES.length : firstFail + 1
    return {
      visible: RULES.slice(0, count).map((r, i) => ({ ...r, ok: results[i] })),
      allPassed: firstFail === -1,
    }
  }, [pw, year])

  const passedCount = visible.filter((r) => r.ok).length
  const won = allPassed && confirm === pw && pw.length > 0
  useEffect(() => {
    if (passedCount > 0) submitBest(passedCount)
  }, [passedCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-xl">
      <label className="block">
        <span className="font-display text-lg font-bold">Choose your password</span>
        <input
          className="field mt-2 font-mono text-lg"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          autoFocus
          aria-describedby="pw-rules"
        />
      </label>
      <div className="mt-2 flex justify-between text-sm text-muted">
        <span>{pw.length} characters</span>
        <span>Rules passed: {passedCount}/{RULES.length} · Best: {best ?? 0}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft" aria-hidden>
        <div className="h-full bg-game transition-all" style={{ width: `${(passedCount / RULES.length) * 100}%` }} />
      </div>

      <ul id="pw-rules" className="mt-5 space-y-2" aria-live="polite">
        {[...visible].reverse().map((r) => (
          <li
            key={r.id}
            className="card flex items-start gap-3 p-3 text-sm"
            style={{ borderColor: r.ok ? '#22c55e' : '#ef4444' }}
          >
            {r.ok ? <Check className="mt-0.5 shrink-0 text-[#22c55e]" size={18} aria-label="Passed" /> : <X className="mt-0.5 shrink-0 text-[#ef4444]" size={18} aria-label="Failed" />}
            <span><b>Rule {r.id}:</b> {r.text(year)}</span>
          </li>
        ))}
      </ul>

      {allPassed && (
        <div className="card mt-5 p-4">
          <label className="block">
            <span className="font-semibold">Final step: retype your password to confirm</span>
            <input className="field mt-2 font-mono" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" spellCheck={false} />
          </label>
          {won && <p className="mt-3 font-display text-2xl font-bold text-[#16a34a]" role="status">🎉 Password accepted. You are now very secure.</p>}
        </div>
      )}
      <p className="mt-6 text-xs text-muted">Nothing you type is stored or sent anywhere. Please don’t use real passwords here.</p>
    </div>
  )
}
