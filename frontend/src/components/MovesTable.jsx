import { useEffect, useRef } from 'react'

const COL_LABELS = 'abcdefghij'.split('')

function toNotation(row, col, boardSize) {
  return `${COL_LABELS[col]}${boardSize - row}`
}

function jumpLabel(from, to) {
  if (!from) return '—'
  const dr = to[0] - from[0]
  const dc = to[1] - from[1]
  return `${dr > 0 ? '+' : ''}${dr}, ${dc > 0 ? '+' : ''}${dc}`
}

export default function MovesTable({ path, currentStep, boardSize }) {
  const activeRowRef = useRef(null)

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentStep])

  if (path.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-0 px-0 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Move Sequence</p>
        <span className="text-xs font-mono text-neutral-500">{path.length} moves</span>
      </div>

      <div className="overflow-y-auto border border-[#2a2a2a] rounded" style={{ maxHeight: 280 }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
            <tr className="border-b border-[#2a2a2a] text-left text-neutral-500">
              <th className="px-3 py-2 font-semibold w-10 text-right">#</th>
              <th className="px-3 py-2 font-semibold">Square</th>
              <th className="px-3 py-2 font-semibold">Row</th>
              <th className="px-3 py-2 font-semibold">Col</th>
              <th className="px-3 py-2 font-semibold">Jump (Δrow, Δcol)</th>
              <th className="px-3 py-2 font-semibold">From → To</th>
            </tr>
          </thead>
          <tbody>
            {path.map((pos, i) => {
              const [row, col] = pos
              const prev       = i > 0 ? path[i - 1] : null
              const isCurrent  = i === currentStep
              const isPast     = currentStep >= 0 && i < currentStep

              return (
                <tr
                  key={i}
                  ref={isCurrent ? activeRowRef : null}
                  className={[
                    'border-b border-[#222] transition-colors',
                    isCurrent ? 'bg-amber-500/10' : 'hover:bg-[#222]',
                    isPast    ? 'text-neutral-600' : 'text-neutral-300',
                  ].join(' ')}
                >
                  <td className="px-3 py-1.5 text-right font-mono text-neutral-600 w-10">{i + 1}</td>
                  <td className="px-3 py-1.5 font-mono font-semibold">
                    <span className={isCurrent ? 'text-amber-400' : ''}>
                      {toNotation(row, col, boardSize)}
                    </span>
                    {isCurrent && <span className="ml-1.5 text-amber-500 text-[11px]">♞</span>}
                  </td>
                  <td className="px-3 py-1.5 font-mono">{row}</td>
                  <td className="px-3 py-1.5 font-mono">{col}</td>
                  <td className="px-3 py-1.5 font-mono text-neutral-500">{jumpLabel(prev, pos)}</td>
                  <td className="px-3 py-1.5 font-mono text-neutral-500">
                    {prev
                      ? `${toNotation(prev[0], prev[1], boardSize)} → ${toNotation(row, col, boardSize)}`
                      : <span className="text-emerald-500 font-semibold">Start</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {currentStep >= 0 && (
        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-3 border-t border-[#2a2a2a] mt-0">
          <span><span className="text-neutral-300 font-semibold">Position:</span>{' '}
            {toNotation(path[currentStep][0], path[currentStep][1], boardSize)}{' '}
            ({path[currentStep][0]}, {path[currentStep][1]})
          </span>
          <span className="text-[#333]">|</span>
          <span><span className="text-neutral-300 font-semibold">Step:</span>{' '}{currentStep + 1} / {path.length}</span>
          {currentStep > 0 && <>
            <span className="text-[#333]">|</span>
            <span><span className="text-neutral-300 font-semibold">Jump:</span>{' '}({jumpLabel(path[currentStep - 1], path[currentStep])})</span>
          </>}
        </div>
      )}
    </div>
  )
}
