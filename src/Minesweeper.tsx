import { useMachine } from "@xstate/react";
import { minesweeperMachine } from "./machine/minesweeperMachine";

function Minesweeper() {
  const [current, send] = useMachine(minesweeperMachine, { devTools: true });
  const gameState = current.value;
  return (
    <div>
      <div>
        <button onClick={() => send("START")}>
          {gameState === "idle" ? "게임 시작" : "게임 중지"}
        </button>
      </div>
    </div>
  );
}

export default Minesweeper;
