export default function BossHealthBar({ boss }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 mx-auto w-3/5">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white drop-shadow">
        <span>{boss.name}</span>
        <span>{boss.percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-white/30 bg-black/50" role="meter" aria-label={`${boss.name} health`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={boss.percent}>
        <div className="h-full transition-[width]" style={{ width: `${boss.percent}%`, background: boss.color }} />
      </div>
    </div>
  )
}
