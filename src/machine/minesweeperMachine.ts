import { assign, createMachine } from "xstate";
import {
  Board,
  checkBombCell,
  checkValidCell,
  removeFlag,
  openAllCellsWithoutAdjacentBombs,
  setFlag,
  firstHandicap,
} from "../game/minesweeper";

type Context = {
  board: Board;
  openedBomb: boolean;
  totalBombs: number;
  firstTouch: boolean;
  numFlags: number;
};

type StartEvent = { type: "START"; board: Board; totalBombs: number };
type FlagEvent = { type: "FLAG"; row: number; col: number };
type RemoveFlagEvent = { type: "REMOVE_FLAG"; row: number; col: number };
type OpenCellEvent = { type: "OPEN_CELL"; row: number; col: number };
type OpenAdjEvent = { type: "OPEN_ADJ"; coords: number[][] };
type ResetEvent = { type: "RESET" };
type Event =
  | StartEvent
  | FlagEvent
  | RemoveFlagEvent
  | OpenCellEvent
  | ResetEvent
  | OpenAdjEvent;

type State =
  | { value: "idle"; context: Context }
  | { value: "playing"; context: Context }
  | { value: "ended"; context: Context };

const initialContext: Context = {
  board: [],
  openedBomb: false,
  totalBombs: 0,
  firstTouch: true,
  numFlags: 0,
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
          OPEN_ADJ: {
            actions: ["openAdjs", "checkBombs"],
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
        numFlags: (context, _event) => {
          const event = _event as FlagEvent;
          if (context.board[event.row][event.col].isOpen)
            return context.numFlags;
          return context.numFlags + 1;
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
        numFlags: (context, _event) => {
          const event = _event as RemoveFlagEvent;
          if (context.board[event.row][event.col].isOpen)
            return context.numFlags;
          return context.numFlags - 1;
        },
      }),
      openCell: assign({
        board: (context, _event) => {
          const event = _event as OpenCellEvent;
          const newBoard: Board = JSON.parse(JSON.stringify(context.board));
          // 처음 오픈할 때 불행하게도 지뢰가 있다면 지뢰가 없는 것과 바꿔치기한다.
          if (
            context.firstTouch &&
            newBoard[event.row][event.col].isBomb === true
          ) {
            firstHandicap(newBoard, event.row, event.col);
          }
          openAllCellsWithoutAdjacentBombs(newBoard, event.row, event.col);
          return newBoard;
        },
        firstTouch: (_, __) => false,
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
      openAdjs: assign({
        board: (context, _event) => {
          const event = _event as OpenAdjEvent;
          const newBoard: Board = JSON.parse(JSON.stringify(context.board));
          event.coords.forEach(([row, col]) => {
            openAllCellsWithoutAdjacentBombs(newBoard, row, col);
          });
          return newBoard;
        },
      }),
      checkBombs: assign({
        openedBomb: (context, _event) => {
          const event = _event as OpenAdjEvent;
          // 검증 함수 안으로 집어넣어라..
          console.log(event.coords);
          let flag = false;
          event.coords.forEach(([row, col]) => {
            if (checkBombCell(context.board, row, col)) {
              flag = true;
              return false;
            }
          });
          return flag;
        },
      }),
    },
  }
);
