import { useState, useEffect, useRef, useCallback } from 'react'
import Board from './components/Board'
import Controls from './components/Controls'
import StatsPanel from './components/StatsPanel'
import MovesTable from './components/MovesTable'

const ALGO_DESC = {
  warnsdorff:         'Greedy heuristic — always move to the square with the fewest onward moves. Finds a complete tour in O(n²) with zero backtracks.',
  backtracking:       'Recursive backtracking guided by Warnsdorff move ordering. Reliable on any board size, near-instant.',
  naive_backtracking: 'Pure recursive backtracking with no heuristics. Hits the node limit on 8×8 — demonstrates why ordering matters.',
}

const BORDER = 'border-[#2a2a2a]'

export default function App() {
  const [boardSize,        setBoardSize]        = useState(8)
  const [algorithm,        setAlgorithm]        = useState('warnsdorff')
  const [startPos,         setStartPos]         = useState([0, 0])
  const [path,             setPath]             = useState([])
  const [currentStep,      setCurrentStep]      = useState(-1)
  const [isPlaying,        setIsPlaying]        = useState(false)
  const [speed,            setSpeed]            = useState(120)
  const [stats,            setStats]            = useState(null)
  const [isLoading,        setIsLoading]        = useState(false)
  const [error,            setError]            = useState(null)
  const [isSelectingStart, setIsSelectingStart] = useState(false)

  const timerRef = useRef(null)

  const stopAnimation = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setIsPlaying(false)
  }, [])

  useEffect(() => () => stopAnimation(), [stopAnimation])

  useEffect(() => {
    if (!isPlaying || !timerRef.current) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= path.length - 1) { stopAnimation(); return prev }
        return prev + 1
      })
    }, speed)
    return () => clearInterval(timerRef.current)
  }, [speed]) // eslint-disable-line react-hooks/exhaustive-deps

  const startAnimation = useCallback((fromPath) => {
    const p = fromPath ?? path
    if (!p?.length) return
    const from = fromPath != null ? 0 : Math.max(0, currentStep)
    setCurrentStep(from)
    setIsPlaying(true)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= p.length - 1) { clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return prev }
        return prev + 1
      })
    }, speed)
  }, [path, currentStep, speed])

  const handleSolve = useCallback(async () => {
    stopAnimation(); setIsLoading(true); setError(null)
    setPath([]); setCurrentStep(-1); setStats(null)
    try {
      const res = await fetch('/api/tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_x: startPos[0], start_y: startPos[1], board_size: boardSize, algorithm }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `HTTP ${res.status}`) }
      const data = await res.json()
      const p = data.path ?? []
      setPath(p)
      setStats({
        success: data.success, time_ms: data.time_ms,
        backtracks: data.backtracks ?? 0, nodes_visited: data.nodes_visited ?? 0,
        total_moves: p.length, board_size: data.board_size,
        algorithm: data.algorithm, hit_limit: data.hit_limit ?? false,
      })
    } catch (e) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [startPos, boardSize, algorithm, stopAnimation])

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    if (currentStep >= path.length - 1) { setCurrentStep(0); setTimeout(() => startAnimation(path), 0) }
    else startAnimation(null)
  }, [isPlaying, currentStep, path, startAnimation])

  const handleReset      = useCallback(() => { stopAnimation(); setCurrentStep(-1) }, [stopAnimation])
  const handleCellClick  = useCallback((row, col) => {
    if (!isSelectingStart) return
    setStartPos([row, col]); setIsSelectingStart(false)
    stopAnimation(); setPath([]); setCurrentStep(-1); setStats(null)
  }, [isSelectingStart, stopAnimation])

  const handleAlgorithmChange = v => {
    setAlgorithm(v); stopAnimation(); setPath([]); setCurrentStep(-1); setStats(null)
  }
  const handleBoardSizeChange = n => {
    setBoardSize(n); stopAnimation(); setPath([]); setCurrentStep(-1); setStats(null)
    setStartPos(([r, c]) => [Math.min(r, n - 1), Math.min(c, n - 1)])
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-neutral-100">

      {/* ── Header ── */}
      <header className={`border-b ${BORDER}`}>
        <div className={`max-w-4xl mx-auto px-6 py-5 border-x ${BORDER}`}>
          <h1 className="text-base font-bold tracking-tight text-white">Knight's Tour</h1>
          <p className="text-neutral-500 text-xs mt-0.5">
            Visualize Warnsdorff's Rule · Heuristic Backtracking · Naive Backtracking
          </p>
        </div>
      </header>

      {/* ── Sectioned content ── */}
      <div className={`max-w-4xl mx-auto border-x ${BORDER}`}>

        {/* Pick-start banner */}
        {isSelectingStart && (
          <div className={`border-b ${BORDER} px-6 py-3 bg-blue-950/40 text-blue-400 text-sm text-center font-medium`}>
            Click any square on the board to set the start position
          </div>
        )}

        {/* ── § Board ── */}
        <section className={`border-b ${BORDER} py-8 flex flex-col items-center gap-3`}>
          <Board
            boardSize={boardSize} path={path} currentStep={currentStep}
            onCellClick={handleCellClick} isSelectingStart={isSelectingStart}
            startPos={startPos}
          />
          {/* Legend */}
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <img src="/knight.png" alt="knight" className="w-4 h-4 object-contain" />Knight
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#bfdbfe' }} />Visited
            </span>
            <span className="text-xs text-neutral-600 font-mono ml-2">
              {isSelectingStart
                ? <span className="text-blue-400">click a square…</span>
                : `(${startPos[0]}, ${startPos[1]}) · ${boardSize}×${boardSize}`}
            </span>
          </div>
        </section>

        {/* ── § Controls ── */}
        <section className={`border-b ${BORDER} px-6 py-5`}>
          <Controls
            algorithm={algorithm}        setAlgorithm={handleAlgorithmChange}
            boardSize={boardSize}        setBoardSize={handleBoardSizeChange}
            speed={speed}               setSpeed={setSpeed}
            onSolve={handleSolve}       onPlay={handlePlay}
            onPause={stopAnimation}     onReset={handleReset}
            onSelectStart={() => setIsSelectingStart(true)}
            isLoading={isLoading}       isPlaying={isPlaying}
            hasSolved={path.length > 0} currentStep={currentStep}
            pathLength={path.length}
          />
        </section>

        {/* Error */}
        {error && (
          <section className={`border-b ${BORDER} px-6 py-3`}>
            <p className="text-sm text-red-400"><strong>Error:</strong> {error}</p>
          </section>
        )}

        {/* ── § Algorithm description ── */}
        <section className={`border-b ${BORDER} px-6 py-4`}>
          <p className="text-xs text-neutral-500 leading-relaxed">
            <span className="font-semibold text-neutral-300">
              {algorithm === 'warnsdorff' ? "Warnsdorff's Rule"
               : algorithm === 'backtracking' ? 'Backtracking + Heuristic'
               : 'Naive Backtracking'}:
            </span>{' '}{ALGO_DESC[algorithm]}
          </p>
        </section>

        {/* ── § Stats + How it works (two-col) ── */}
        <section className={`border-b ${BORDER} grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2a2a2a]`}>
          <div className="px-6 py-6">
            {stats
              ? <StatsPanel stats={stats} />
              : <p className="text-xs text-neutral-600 mt-1">Results will appear after solving.</p>
            }
          </div>
          <div className="px-6 py-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">How It Works</p>
            <p className="text-xs text-neutral-400 leading-relaxed mb-2">
              The <span className="text-neutral-200 font-semibold">Knight's Tour</span> asks: can a chess knight
              visit every square on the board exactly once?
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed mb-2">
              <span className="text-neutral-200 font-semibold">Warnsdorff (1823)</span> — always jump to the square
              reachable from the fewest squares next. Greedy and near-instant for any board size.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              <span className="text-neutral-200 font-semibold">Backtracking</span> explores all paths recursively.
              Without heuristic ordering the search space explodes; with it, a solution is found before any
              backtracking occurs.
            </p>
          </div>
        </section>

        {/* ── § Algorithm comparison ── */}
        <section className={`border-b ${BORDER}`}>
          <div className={`px-6 py-4 border-b ${BORDER}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Algorithm Comparison</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className={`border-b ${BORDER} text-left text-neutral-500`}>
                <th className="px-6 py-2.5 font-semibold">Algorithm</th>
                <th className="px-6 py-2.5 font-semibold text-right">Typical backtracks</th>
                <th className="px-6 py-2.5 font-semibold text-right">Speed</th>
                <th className="px-6 py-2.5 font-semibold text-right">8×8 reliable?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Warnsdorff's Rule",        bt: '0',        spd: '~0.5 ms',  ok: true  },
                { name: 'Backtracking + Heuristic', bt: '0',        spd: '~0.5 ms',  ok: true  },
                { name: 'Naive Backtracking',       bt: '500,000+', spd: '~650 ms',  ok: false },
              ].map((row, i, arr) => (
                <tr key={row.name}
                    className={`${i < arr.length - 1 ? `border-b ${BORDER}` : ''} hover:bg-[#222] transition-colors`}>
                  <td className="px-6 py-3 font-medium text-neutral-300">{row.name}</td>
                  <td className={`px-6 py-3 text-right font-mono ${row.ok ? 'text-emerald-500' : 'text-red-400'}`}>{row.bt}</td>
                  <td className="px-6 py-3 text-right font-mono text-neutral-400">{row.spd}</td>
                  <td className={`px-6 py-3 text-right font-semibold ${row.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                    {row.ok ? '✓ Yes' : '✗ No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── § Move sequence ── */}
        {path.length > 0 && (
          <section className="px-6 py-6">
            <MovesTable path={path} currentStep={currentStep} boardSize={boardSize} />
          </section>
        )}

      </div>

      {/* Bottom border cap */}
      <div className={`max-w-4xl mx-auto border-x border-b ${BORDER} h-px`} />
    </div>
  )
}
