const ALGO_LABELS = {
  warnsdorff:             "Warnsdorff's Rule",
  backtracking_heuristic: 'Backtracking + Heuristic',
  naive_backtracking:     'Naive Backtracking',
}

function Metric({ label, value, accent }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-[#242424] last:border-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className={`text-sm font-mono font-semibold ${accent ? 'text-red-400' : 'text-neutral-100'}`}>
        {value}
      </span>
    </div>
  )
}

export default function StatsPanel({ stats }) {
  if (!stats) return null
  const { success, time_ms, backtracks, nodes_visited, total_moves, board_size, algorithm, hit_limit } = stats
  const total    = board_size * board_size
  const coverage = Math.round((total_moves / total) * 100)

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Results</p>

      {/* Status */}
      <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold mb-4
        ${success   ? 'bg-emerald-900/40 text-emerald-400 ring-1 ring-emerald-800'
        : hit_limit ? 'bg-red-900/40 text-red-400 ring-1 ring-red-900'
                    : 'bg-yellow-900/40 text-yellow-400 ring-1 ring-yellow-900'}`}>
        <span>{success ? '✓' : '✗'}</span>
        <span>
          {success
            ? `Complete — all ${total} squares`
            : hit_limit ? 'Incomplete — limit reached'
            : 'Incomplete tour'}
        </span>
      </div>

      {/* Coverage bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5">
          <span>Coverage</span>
          <span className="font-mono text-neutral-300">{total_moves}/{total}</span>
        </div>
        <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${success ? 'bg-emerald-500' : 'bg-amber-500'}`}
               style={{ width: `${coverage}%` }} />
        </div>
      </div>

      <div className="mt-3">
        <Metric label="Algorithm"     value={ALGO_LABELS[algorithm] ?? algorithm} />
        <Metric label="Backtracks"    value={backtracks.toLocaleString()} accent={backtracks > 10000} />
        <Metric label="Nodes visited" value={nodes_visited.toLocaleString()} />
        <Metric label="Solve time"    value={`${time_ms} ms`} />
      </div>

      {hit_limit && (
        <p className="mt-3 text-xs text-red-400 leading-snug">
          Hit the node limit after {nodes_visited.toLocaleString()} nodes. Switch to{' '}
          <strong>Backtracking + Heuristic</strong> to see it solve instantly.
        </p>
      )}
    </div>
  )
}
