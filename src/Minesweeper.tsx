import { useMachine } from "@xstate/react";
import { useCallback, useEffect } from "react";
import {
  Board,
  canOpenAdjs,
  createBoard,
  placeBombs,
} from "./game/minesweeper";
import { minesweeperMachine } from "./machine/minesweeperMachine";

function Minesweeper() {
  const [state, send] = useMachine(minesweeperMachine, { devTools: true });
  const { board, totalBombs, openedBomb, numFlags } = state.context;

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
  const handleOpenAdjs = useCallback(
    (board: Board, row: number, col: number) => (e: any) => {
      e.preventDefault();
      const availableAdjs = canOpenAdjs(board, row, col);
      send({ type: "OPEN_ADJ", coords: availableAdjs });
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
        / 지뢰: {totalBombs - numFlags > 0 ? totalBombs - numFlags : "??"}
      </div>
      <div>
        <div style={{ marginBottom: "1em" }}>
          <strong>게임 방법</strong>
          <ul>
            <li>기본적으론 알고 계신 그 규칙이 그대로 적용됩니다.</li>
            <li>클릭: 상자 열기</li>
            <li>우클릭: 깃발 꽂기 / 해제</li>
            <li>
              이미 연 곳에서 우클릭: 확실한 모든 영역 열기 (깃발로 표시한 안 연
              갯수 = 해당 연 곳의 숫자)
            </li>
          </ul>
        </div>
        <div>
          <strong>소스코드</strong>
          <div>
            <a
              href="https://github.com/ynifamily3/react-minesweeper"
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/ynifamily3/react-minesweeper
            </a>
          </div>
        </div>
      </div>
      <button onClick={state.matches("idle") ? handleStart : handleReset}>
        {state.matches("idle") ? "시작하기" : "다시하기"}
      </button>
      <div style={{ display: "flex" }}>
        <table onContextMenu={(e) => e.preventDefault()}>
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
                        opacity: col.isOpen ? 0.5 : 1,
                      }}
                      disabled={state.matches("ended")}
                      onClick={
                        !col.isOpen && !col.isFlag ? handleOpen(i, j) : () => {}
                      }
                      onContextMenu={
                        !col.isOpen
                          ? handleContextMenu(i, j, !col.isFlag)
                          : handleOpenAdjs(board, i, j)
                      }
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
