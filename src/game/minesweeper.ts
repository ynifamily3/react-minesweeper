export type Cell = {
  isFlag: boolean;
  isOpen: boolean;
  number: number;
  isBomb: boolean;
};

export type Board = Cell[][];

export function createBoard(size: number): Board {
  return Array.from<unknown, Cell[]>({ length: size }, () =>
    Array.from<unknown, Cell>({ length: size }, () => ({
      isOpen: false,
      isFlag: false,
      number: 0,
      isBomb: false,
    }))
  );
}

export function placeBombs(board: Board, bombs: number): Board {
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const randomIdxFactory = () => Math.floor(Math.random() * newBoard.length);
  let remain = bombs;
  while (remain > 0) {
    const row = randomIdxFactory();
    const col = randomIdxFactory();

    if (!newBoard[row][col].isBomb) {
      remain--;
      newBoard[row][col].isBomb = true;
    }
  }
  return newBoard;
}

// 범위를 안 벗어났는지 체크한다.
export function checkValidCell(
  board: Board,
  row: number,
  col: number
): boolean {
  return true;
}

// 열었는지 안 열었는지 체크한다. (범위체크 후)
export function checkOpened(board: Board, row: number, col: number): boolean {
  return true;
}

// Flag를 놓는다. (범위체크 후, 이미 open된것은 pass)
export function setFlag(board: Board, row: number, col: number): void {}

// Flag를 푼다. (범위체크 후, 이미 open된것은 pass)
export function removeFlag(board: Board, row: number, col: number): void {}

// cell을 open한다. (범위체크 후)
export function openCell(board: Board, row: number, col: number): void {}

// 지뢰인지 판별한다. (범위체크 후)
export function checkBombCell(board: Board, row: number, col: number): boolean {
  return true;
}

// 주변의 지뢰 수를 센다 (범위체크 후, 자기가 지뢰가 아니면, 8방위를 다 센다)
export function countAdjacentBombs(
  board: Board,
  row: number,
  col: number
): number {
  return 0;
}
// 주변에 지뢰가 없는 칸들이 있을 경우 연쇄적으로 연다.
export function openAllCellsWithoutAdjacentBombs(
  board: Board,
  row: number,
  col: number,
  checkedPositions: { [key: string]: true } = {}
) {}
