import { assign, createMachine } from "xstate";
import {
  Board,
  checkBombCell,
  checkValidCell,
  removeFlag,
  openAllCellsWithoutAdjacentBombs,
  setFlag,
} from "../game/minesweeper";

type Context = {
  board: Board;
  openedBomb: boolean;
  totalBombs: number;
};

type StartEvent = { type: "START"; board: Board; totalBombs: number };
type FlagEvent = { type: "FLAG"; row: number; col: number };
type RemoveFlagEvent = { type: "REMOVE_FLAG"; row: number; col: number };
type OpenCellEvent = { type: "OPEN_CELL"; row: number; col: number };
type ResetEvent = { type: "RESET" };
type Event =
  | StartEvent
  | FlagEvent
  | RemoveFlagEvent
  | OpenCellEvent
  | ResetEvent;

type State =
  | { value: "idle"; context: Context }
  | { value: "playing"; context: Context }
  | { value: "ended"; context: Context };

const initialContext: Context = {
  board: [],
  openedBomb: false,
  totalBombs: 0,
};

export const minesweeperMachine = createMachine<Context, Event, State>(
  {
    id: "minesweeper",
    initial: "idle",
    context: initialContext,
    states: {
      idle: {
        type: "atomic",
        entry: "resetGame", // 게임 판 초기화 액션
        on: {
          START: {
            target: "playing",
            actions: "setBoardAndTotalBombs",
          },
        },
      },
      playing: {
        type: "atomic",
        always: [
          {
            target: "ended",
            cond: "hasOpenedBomb", // 가드로 판별함
          },
          {
            target: "ended",
            cond: "hasOpenAllCells",
          },
        ],
        on: {
          FLAG: {
            actions: "setFlag",
          },
          REMOVE_FLAG: {
            actions: "removeFlag",
          },
          OPEN_CELL: {
            actions: ["openCell", "checkBomb"],
          },
          RESET: {
            target: "idle",
          },
        },
      },
      ended: {
        type: "atomic",
        on: {
          RESET: {
            target: "idle",
          },
        },
      },
    },
  },
  {
    guards: {
      hasOpenedBomb: (context) => context.openedBomb,
      hasOpenAllCells: (context) =>
        context.board.every((row) =>
          row.every((cell) => (cell.isBomb ? !cell.isOpen : cell.isOpen))
        ),
    },
    actions: {
      resetGame: assign(initialContext),
      setBoardAndTotalBombs: assign({
        board: (_, event) => (event as StartEvent).board, // 이벤트의 페이로드 수신받은 것으로 적용
        totalBombs: (_, event) => (event as StartEvent).totalBombs,
      }),
      setFlag: assign({
        board: (context, _event) => {
          const event = _event as FlagEvent;
          const newBoard: Board = JSON.parse(JSON.stringify(context.board));
          // 검증 함수 안으로 집어넣어라..
          if (checkValidCell(newBoard, event.row, event.col)) {
            setFlag(newBoard, event.row, event.col);
          }
          return newBoard;
        },
      }),
      removeFlag: assign({
        board: (context, _event) => {
          const event = _event as RemoveFlagEvent;
          const newBoard: Board = JSON.parse(JSON.stringify(context.board));
          // 검증 함수 안으로 집어넣어라..
          if (checkValidCell(newBoard, event.row, event.col)) {
            removeFlag(newBoard, event.row, event.col);
          }
          return newBoard;
        },
      }),
      openCell: assign({
        board: (context, _event) => {
          const event = _event as OpenCellEvent;
          const newBoard: Board = JSON.parse(JSON.stringify(context.board));
          openAllCellsWithoutAdjacentBombs(newBoard, event.row, event.col);
          return newBoard;
        },
      }),
      checkBomb: assign({
        openedBomb: (context, _event) => {
          const event = _event as OpenCellEvent;
          // 검증 함수 안으로 집어넣어라..
          return (
            checkValidCell(context.board, event.row, event.col) &&
            checkBombCell(context.board, event.row, event.col)
          );
        },
      }),
    },
  }
);
