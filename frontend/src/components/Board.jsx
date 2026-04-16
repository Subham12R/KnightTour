const LIGHT         = '#f0d9b5'
const DARK          = '#b58863'
const VISITED_LIGHT = '#bfdbfe'
const VISITED_DARK  = '#60a5fa'
const CURRENT_BG    = '#f59e0b'
const COL_LABELS    = 'abcdefghij'.split('')

export default function Board({ boardSize, path, currentStep, onCellClick, isSelectingStart, startPos }) {
  const visitedMap = new Map()
  if (currentStep >= 0) {
    for (let i = 0; i <= currentStep && i < path.length; i++) {
      const [r, c] = path[i]
      visitedMap.set(`${r}-${c}`, i + 1)
    }
  }

  const knightPos =
    currentStep >= 0 && currentStep < path.length
      ? path[currentStep]
      : startPos

  const MAX_CELL = 80
  const cellSize = Math.min(MAX_CELL, Math.floor(640 / boardSize))
  const boardPx  = cellSize * boardSize
  const knightPx = Math.floor(cellSize * 0.76)
  const numPx    = Math.max(10, Math.floor(cellSize * 0.26))

  return (
    <div className="flex flex-col items-start select-none">
      {/* Column labels */}
      <div className="flex" style={{ marginLeft: 28, width: boardPx }}>
        {Array.from({ length: boardSize }, (_, i) => (
          <div key={i} className="text-center text-xs text-neutral-500 font-mono font-medium" style={{ width: cellSize }}>
            {COL_LABELS[i]}
          </div>
        ))}
      </div>

      <div className="flex items-start">
        {/* Row labels */}
        <div className="flex flex-col" style={{ width: 24, marginRight: 4 }}>
          {Array.from({ length: boardSize }, (_, i) => (
            <div key={i} className="flex items-center justify-end pr-1 text-xs text-neutral-500 font-mono font-medium" style={{ height: cellSize }}>
              {boardSize - i}
            </div>
          ))}
        </div>

        {/* Board */}
        <div
          className="shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
            gridTemplateRows:    `repeat(${boardSize}, ${cellSize}px)`,
            width: boardPx, height: boardPx,
            border: '2px solid #3a3a3a',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: boardSize }, (_, row) =>
            Array.from({ length: boardSize }, (_, col) => {
              const isLight   = (row + col) % 2 === 0
              const key       = `${row}-${col}`
              const moveNum   = visitedMap.get(key)
              const isCurrent = knightPos?.[0] === row && knightPos?.[1] === col
              const isVisited = moveNum !== undefined && !isCurrent

              let bg = isLight ? LIGHT : DARK
              if (isCurrent)   bg = CURRENT_BG
              else if (isVisited) bg = isLight ? VISITED_LIGHT : VISITED_DARK

              return (
                <div
                  key={key}
                  className={`board-cell relative flex items-center justify-center
                    ${isSelectingStart ? 'cursor-crosshair' : 'cursor-pointer'}
                    ${!isCurrent && !isVisited ? 'hover:brightness-90' : ''}
                    ${isCurrent ? 'cell-visited-flash' : ''}`}
                  style={{ backgroundColor: bg, width: cellSize, height: cellSize }}
                  onClick={() => onCellClick(row, col)}
                  title={`${COL_LABELS[col]}${boardSize - row}  (${row}, ${col})`}
                >
                  {isCurrent ? (
                    <img
                      key={`k-${currentStep}-${row}-${col}`}
                      src="/knight.png"
                      alt="knight"
                      className="knight-land"
                      style={{
                        width: knightPx, height: knightPx,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.55))',
                      }}
                    />
                  ) : isVisited ? (
                    <span className="font-bold font-mono leading-none"
                      style={{ fontSize: numPx, color: isLight ? '#1e3a5f' : '#dbeafe' }}>
                      {moveNum}
                    </span>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
