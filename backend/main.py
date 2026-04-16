from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import time

from algorithms.warnsdorff import solve_warnsdorff
from algorithms.backtracking import solve_backtracking

app = FastAPI(title="Knight's Tour API", version="1.0.0")


class TourRequest(BaseModel):
    start_x: int = Field(0, ge=0, le=9, description="Row index (0-based)")
    start_y: int = Field(0, ge=0, le=9, description="Column index (0-based)")
    board_size: int = Field(8, ge=5, le=10, description="Board dimension (N×N)")
    algorithm: str = Field("warnsdorff", description="warnsdorff | backtracking | naive_backtracking")


@app.get("/health")
def health():
    return {"status": "ok", "message": "Knight's Tour API is running"}


@app.post("/api/tour")
def compute_tour(req: TourRequest):
    if req.start_x >= req.board_size or req.start_y >= req.board_size:
        raise HTTPException(
            status_code=400,
            detail=f"Start position ({req.start_x}, {req.start_y}) is out of bounds for a {req.board_size}×{req.board_size} board.",
        )

    t0 = time.perf_counter()

    if req.algorithm == "warnsdorff":
        result = solve_warnsdorff(req.start_x, req.start_y, req.board_size)

    elif req.algorithm == "backtracking":
        result = solve_backtracking(
            req.start_x, req.start_y, req.board_size, use_heuristic=True
        )

    elif req.algorithm == "naive_backtracking":
        result = solve_backtracking(
            req.start_x, req.start_y, req.board_size, use_heuristic=False
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown algorithm '{req.algorithm}'. Choose: warnsdorff, backtracking, naive_backtracking",
        )

    result["time_ms"] = round((time.perf_counter() - t0) * 1000, 2)
    result["board_size"] = req.board_size
    result["start"] = [req.start_x, req.start_y]
    return result
