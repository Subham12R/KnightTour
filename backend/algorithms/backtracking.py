"""
Knight's Tour via Recursive Backtracking.

Two modes:
  use_heuristic=True  → Warnsdorff move ordering applied before each recursive call.
                        Finds a complete tour almost instantly (typically 0 backtracks).
  use_heuristic=False → Naive ordering (fixed MOVES list). Will explore many dead ends.
                        Hits MAX_NODES limit quickly on 8×8 — demonstrating why
                        heuristics matter.
"""

import sys

sys.setrecursionlimit(10_000)

MOVES = [(2, 1), (2, -1), (-2, 1), (-2, -1), (1, 2), (1, -2), (-1, 2), (-1, -2)]

# Cap for naive backtracking so the server stays responsive
MAX_NODES_NAIVE = 500_000
MAX_NODES_HEURISTIC = 5_000_000


def solve_backtracking(sx: int, sy: int, n: int = 8, use_heuristic: bool = True) -> dict:
    board = [[-1] * n for _ in range(n)]
    path = [[sx, sy]]
    board[sx][sy] = 0
    stats = {"backtracks": 0, "nodes": 0}
    max_nodes = MAX_NODES_HEURISTIC if use_heuristic else MAX_NODES_NAIVE

    def is_valid(x: int, y: int) -> bool:
        return 0 <= x < n and 0 <= y < n and board[x][y] == -1

    def degree(x: int, y: int) -> int:
        return sum(1 for dx, dy in MOVES if is_valid(x + dx, y + dy))

    def backtrack(x: int, y: int, move_num: int) -> bool:
        if stats["nodes"] > max_nodes:
            return False
        if move_num == n * n:
            return True

        # Generate candidate moves
        candidates = [(x + dx, y + dy) for dx, dy in MOVES if is_valid(x + dx, y + dy)]

        if use_heuristic:
            # Warnsdorff ordering: try lowest-degree squares first
            candidates.sort(key=lambda pos: degree(pos[0], pos[1]))

        for nx, ny in candidates:
            board[nx][ny] = move_num
            path.append([nx, ny])
            stats["nodes"] += 1

            if backtrack(nx, ny, move_num + 1):
                return True

            # Dead end — backtrack
            board[nx][ny] = -1
            path.pop()
            stats["backtracks"] += 1

        return False

    success = backtrack(sx, sy, 1)

    return {
        "path": path,
        "success": success,
        "algorithm": "backtracking_heuristic" if use_heuristic else "naive_backtracking",
        "backtracks": stats["backtracks"],
        "nodes_visited": stats["nodes"],
        "hit_limit": stats["nodes"] > max_nodes,
    }
