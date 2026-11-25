import { useEffect, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { idbCount, isStorageAvailable, listKeys, readItem, resetEverything, soundStore, themeStore, usageBytes, useStore } from '../services/storage/index.js'
import { useSeo, useSound } from '../hooks/index.js'

export default function Settings() {
  useSeo({ title: 'Settings', description: 'Theme, sound and local data controls for letbe.fun.', path: '/settings' })
  const theme = useStore(themeStore)
  const sound = useStore(soundStore)
  const play = useSound()
  const [info, setInfo] = useState({ keys: 0, bytes: 0, idb: 0 })
  const [confirming, setConfirming] = useState(false)
  const [msg, setMsg] = useState('')

  const refresh = async () => setInfo({ keys: listKeys().length, bytes: usageBytes(), idb: await idbCount() })
  useEffect(() => {
    refresh()
  }, [])

  const exportData = () => {
    const dump = Object.fromEntries(listKeys().map((k) => [k, readItem(k, null)]))
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'letbe-fun-data.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mx-auto max-w-2xl pt-10">
      <h1 id="settings-title" className="text-4xl font-extrabold sm:text-5xl">Settings</h1>

      <section className="card mt-8 p-6" aria-labelledby="s-theme">
        <h2 id="s-theme" className="text-lg font-bold">Theme</h2>
        <div className="mt-3 flex gap-2" role="group" aria-label="Theme">
          {['system', 'light', 'dark'].map((t) => (
            <button key={t} className="chip !px-4 !py-2 capitalize" aria-pressed={theme === t} onClick={() => themeStore.set(t)}>{t}</button>
          ))}
        </div>
      </section>

      <section className="card mt-4 p-6" aria-labelledby="s-sound">
        <h2 id="s-sound" className="text-lg font-bold">Sound</h2>
        <p className="mt-1 text-sm text-muted">Tiny synthesized beeps and clicks. No audio files are downloaded.</p>
        <label className="mt-3 flex items-center gap-3">
          <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={sound} onChange={(e) => { soundStore.set(e.target.checked); if (e.target.checked) setTimeout(() => play('good'), 50) }} />
          Sound effects
        </label>
      </section>

      <section className="card mt-4 p-6" aria-labelledby="s-data">
        <h2 id="s-data" className="text-lg font-bold">Your local data</h2>
        <p className="mt-1 text-sm text-muted">
          {isStorageAvailable() ? 'Saved in this browser only.' : 'Browser storage is unavailable — progress will not persist after you close the tab.'}{' '}
          {info.keys} settings/scores · {(info.bytes / 1024).toFixed(1)} KB · {info.idb} larger saved items.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={exportData}><Download size={15} aria-hidden /> Export JSON</button>
          {!confirming ? (
            <button className="btn" onClick={() => setConfirming(true)}><Trash2 size={15} aria-hidden /> Reset all data</button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={async () => { await resetEverything(); setConfirming(false); setMsg('All local data deleted.'); refresh() }}>Yes, delete everything</button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
            </>
          )}
        </div>
        <p role="status" className="mt-3 text-sm text-accent">{msg}</p>
      </section>
    </div>
  )
}
