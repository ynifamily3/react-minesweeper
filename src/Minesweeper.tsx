import { useMachine } from "@xstate/react";
import { useCallback, useEffect } from "react";
import { createBoard, placeBombs } from "./game/minesweeper";
import { minesweeperMachine } from "./machine/minesweeperMachine";

function Minesweeper() {
  const [state, send] = useMachine(minesweeperMachine, { devTools: true });
  const { board, totalBombs, openedBomb } = state.context;

  const handleStart = useCallback(() => {
    const totalBombs = 10;
    const board = placeBombs(createBoard(9), totalBombs);
    send({ type: "START", board, totalBombs });
  }, [send]);

  const handleReset = useCallback(() => {
    send({ type: "RESET" });
  }, [send]);

  const handleOpen = useCallback(
    (row: number, col: number) => () => {
      send({ type: "OPEN_CELL", row, col });
    },
    [send]
  );
  const handleContextMenu = useCallback(
    (row: number, col: number, flag: boolean) => (e: any) => {
      e.preventDefault();
      send({ type: flag ? "FLAG" : "REMOVE_FLAG", row, col });
    },
    [send]
  );

  // 디버그
  useEffect(() => {
    handleStart();
  }, [handleStart]);
  return (
    <div>
      <div>
        지뢰찾기{" "}
        {!state.matches("idle") && state.matches("playing")
          ? "진행 중"
          : openedBomb
          ? "게임 오버"
          : "게임 클리어!"}{" "}
        / 폭탄: {totalBombs}
      </div>
      <button onClick={state.matches("idle") ? handleStart : handleReset}>
        {state.matches("idle") ? "시작하기" : "다시하기"}
      </button>
      <div style={{ display: "flex" }}>
        <table>
          <tbody>
            {board.map((row, i) => (
              <tr key={"row-" + i}>
                {row.map((col, j) => (
                  <td
                    key={"col-" + i + "-" + j}
                    style={{ width: 50, height: 50 }}
                  >
                    <button
                      style={{
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                      disabled={col.isOpen || state.matches("ended")}
                      onClick={!col.isFlag ? handleOpen(i, j) : () => {}}
                      onContextMenu={handleContextMenu(i, j, !col.isFlag)}
                    >
                      {!state.matches("ended") &&
                        (col.isOpen ? col.number : col.isFlag ? "🚩" : "_")}
                      {state.matches("ended") &&
                        (col.isBomb
                          ? "X"
                          : col.isOpen
                          ? col.number
                          : col.isFlag
                          ? "🚩"
                          : "_")}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* <table style={{ marginLeft: "3em" }}>
          <tbody>
            {board.map((row, i) => (
              <tr key={"row-" + i}>
                {row.map((col, j) => (
                  <td
                    key={"col-" + i + "-" + j}
                    style={{ width: 50, height: 50 }}
                  >
                    <button
                      style={{
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                      disabled
                    >
                      {col.isBomb ? "X" : col.number}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}

export default Minesweeper;
