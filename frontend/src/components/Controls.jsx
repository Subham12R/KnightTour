const ALGORITHMS = [
  { id: 'warnsdorff',         label: "Warnsdorff's Rule",        badge: 'Greedy',      badgeClass: 'bg-emerald-900/60 text-emerald-400' },
  { id: 'backtracking',       label: 'Backtracking + Heuristic',  badge: 'Hybrid',      badgeClass: 'bg-blue-900/60 text-blue-400' },
  { id: 'naive_backtracking', label: 'Naive Backtracking',        badge: 'Brute-force', badgeClass: 'bg-red-900/60 text-red-400' },
]

function Label({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
      {children}
    </p>
  )
}

export default function Controls({
  algorithm, setAlgorithm,
  boardSize, setBoardSize,
  speed, setSpeed,
  onSolve, onPlay, onPause, onReset, onSelectStart,
  isLoading, isPlaying, hasSolved, currentStep, pathLength,
}) {
  const canPlay  = hasSolved && !isPlaying
  const canPause = isPlaying
  const progress = pathLength > 0 ? Math.round(((currentStep + 1) / pathLength) * 100) : 0
  const done     = hasSolved && currentStep >= pathLength - 1 && !isPlaying

  return (
    <div className="flex flex-col gap-5">

      {/* Row 1 */}
      <div className="flex flex-wrap items-end gap-5">

        {/* Algorithm */}
        <div className="flex-1 min-w-[180px]">
          <Label>Algorithm</Label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value)}
            disabled={isLoading || isPlaying}
            className="w-full bg-[#242424] border border-[#333] text-neutral-200 rounded
                       px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ALGORITHMS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>

        {/* Board size */}
        <div>
          <Label>Board</Label>
          <div className="flex gap-1">
            {[5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => setBoardSize(n)}
                disabled={isLoading || isPlaying}
                className={`px-2.5 py-1.5 text-sm font-mono font-semibold rounded border transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${boardSize === n
                    ? 'bg-white text-gray-900 border-white'
                    : 'bg-transparent text-neutral-400 border-[#333] hover:border-neutral-500 hover:text-neutral-200'}`}
              >
                {n}×{n}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="flex-1 min-w-[140px]">
          <Label>Speed — <span className="font-mono normal-case text-neutral-400">{speed}ms/step</span></Label>
          <input
            type="range" min={30} max={700} step={10} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[10px] text-neutral-600 mt-0.5">
            <span>Fast</span><span>Slow</span>
          </div>
        </div>

        {/* Pick start */}
        <div>
          <Label>Start</Label>
          <button
            onClick={onSelectStart}
            disabled={isLoading || isPlaying}
            className="px-3 py-1.5 text-sm border border-dashed border-[#444] rounded text-neutral-500
                       hover:border-neutral-400 hover:text-neutral-300 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Pick on board
          </button>
        </div>
      </div>

      {/* Row 2: actions + progress */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onSolve}
          disabled={isLoading || isPlaying}
          className="px-5 py-2 font-semibold text-sm rounded bg-white text-gray-900
                     hover:bg-neutral-200 active:scale-[0.98] transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                Solving…
              </span>
            : 'Solve'}
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        {[
          { label: '▶ Play',   onClick: onPlay,  disabled: !canPlay  },
          { label: '⏸ Pause', onClick: onPause, disabled: !canPause },
          { label: '↺ Reset',  onClick: onReset, disabled: isLoading },
        ].map(({ label, onClick, disabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            className="px-3 py-2 text-sm border border-[#333] rounded text-neutral-300
                       hover:border-neutral-500 hover:text-white transition-all
                       disabled:opacity-25 disabled:cursor-not-allowed font-medium"
          >
            {label}
          </button>
        ))}

        {hasSolved && (
          <div className="flex-1 min-w-[120px] ml-2">
            <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
              <span className="font-mono">{done ? '✓ Complete' : `Step ${Math.max(0, currentStep + 1)} / ${pathLength}`}</span>
              <span className="font-mono font-semibold text-neutral-300">{progress}%</span>
            </div>
            <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-100"
                   style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
