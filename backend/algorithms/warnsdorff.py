"""
Warnsdorff's Rule (1823)
Greedy heuristic: always move to the square with the fewest onward moves.
Finds a complete tour in O(n²) time with near-zero backtracking.
"""

MOVES = [(2, 1), (2, -1), (-2, 1), (-2, -1), (1, 2), (1, -2), (-1, 2), (-1, -2)]


def _degree(x: int, y: int, visited: list[list[bool]], n: int) -> int:
    """Count how many unvisited squares a knight at (x, y) can reach."""
    return sum(
        1
        for dx, dy in MOVES
        if 0 <= x + dx < n and 0 <= y + dy < n and not visited[x + dx][y + dy]
    )


def solve_warnsdorff(sx: int, sy: int, n: int = 8) -> dict:
    visited = [[False] * n for _ in range(n)]
    path = [[sx, sy]]
    visited[sx][sy] = True
    x, y = sx, sy

    for _ in range(n * n - 1):
        candidates = []
        for dx, dy in MOVES:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < n and not visited[nx][ny]:
                deg = _degree(nx, ny, visited, n)
                candidates.append((deg, nx, ny))

        if not candidates:
            break

        # Pick the square with the minimum onward moves (Warnsdorff's key step)
        candidates.sort(key=lambda c: c[0])
        _, nx, ny = candidates[0]
        visited[nx][ny] = True
        path.append([nx, ny])
        x, y = nx, ny

    return {
        "path": path,
        "success": len(path) == n * n,
        "algorithm": "warnsdorff",
        "backtracks": 0,
        "nodes_visited": len(path),
    }
