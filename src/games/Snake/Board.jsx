import { memo } from 'react'
import { COLORS } from './logic.js'

const STAR = 'M0,-0.46 L0.13,-0.15 L0.46,-0.13 L0.2,0.09 L0.29,0.42 L0,0.23 L-0.29,0.42 L-0.2,0.09 L-0.46,-0.13 L-0.13,-0.15 Z'

const Checks = memo(function Checks({ n }) {
  return (
    <g fill="currentColor" opacity="0.045">
      {Array.from({ length: n * n }, (_, i) => ((i % n) + Math.floor(i / n)) % 2 === 0 && <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" />)}
    </g>
  )
})

/** The playfield, drawn in a coordinate system of one unit per cell. */
export default function Board({ game, dead }) {
  const { n, snake, food, bonus, dir } = game
  const head = snake[0]
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="block h-full w-full text-ink" role="img" aria-label={`Snake board, length ${snake.length}`}>
      <Checks n={n} />

      {food && (
        <g transform={`translate(${food.x + 0.5} ${food.y + 0.5})`}>
          <circle r="0.62" fill="#ef4444" opacity="0.2" className="animate-pulse" />
          <circle cy="0.04" r="0.38" fill="#ef4444" />
          <circle cx="-0.12" cy="-0.08" r="0.09" fill="#fecaca" />
          <path d="M0,-0.3 Q0.05,-0.52 0.26,-0.5 Q0.2,-0.3 0,-0.3Z" fill="#22c55e" />
        </g>
      )}

      {bonus && (
        <g transform={`translate(${bonus.x + 0.5} ${bonus.y + 0.5})`}>
          {/* The ring shrinks as time runs out. */}
          <circle r="0.6" fill="none" stroke="#fbbf24" strokeWidth="0.1" pathLength="100" strokeDasharray={`${(bonus.left / bonus.total) * 100} 100`} transform="rotate(-90)" />
          <path d={STAR} fill="#fbbf24" />
        </g>
      )}

      <g opacity={dead ? 0.55 : 1}>
        {/* Tail first, so the head is on top. Segments split by wrapping are not joined. */}
        {snake.map((_, k) => {
          const i = snake.length - 1 - k
          const a = snake[i]
          const b = snake[i - 1]
          const width = 0.82 - (i / snake.length) * 0.3
          const color = `color-mix(in srgb, ${COLORS.head} ${Math.round(100 - (i / Math.max(1, snake.length - 1)) * 100)}%, ${COLORS.body})`
          const joined = b && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1
          return (
            <line
              key={i}
              x1={a.x + 0.5}
              y1={a.y + 0.5}
              x2={(joined ? b.x : a.x) + 0.5}
              y2={(joined ? b.y : a.y) + 0.5}
              stroke={color}
              strokeWidth={width}
              strokeLinecap="round"
            />
          )
        })}
        <g transform={`translate(${head.x + 0.5} ${head.y + 0.5}) rotate(${(Math.atan2(dir[1], dir[0]) * 180) / Math.PI})`}>
          <circle r="0.48" fill={COLORS.head} />
          {[-0.19, 0.19].map((y) => (
            <g key={y} transform={`translate(0.14 ${y})`}>
              <circle r="0.14" fill="#fff" />
              {dead ? <path d="M-0.08,-0.08 L0.08,0.08 M0.08,-0.08 L-0.08,0.08" stroke="#111" strokeWidth="0.05" /> : <circle cx="0.04" r="0.07" fill="#111" />}
            </g>
          ))}
        </g>
      </g>
    </svg>
  )
}
