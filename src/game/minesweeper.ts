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

// 지뢰를 매설하고 numbers 모든 영역에 number를 설정합니다.
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
      newBoard[row][col].number = countAdjacentBombs(board, row, col);
    }
  }
  // 모든 영역에 number를 설정합니다.
  for (let i = 0; i < newBoard.length; i++) {
    for (let j = 0; j < newBoard[i].length; j++) {
      if (!newBoard[i][j].isBomb)
        newBoard[i][j].number = countAdjacentBombs(newBoard, i, j);
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
  return !!board[row] && !!board[row][col];
}

// 열었는지 안 열었는지 체크한다. (범위체크 후)
export function checkOpened(board: Board, row: number, col: number): boolean {
  return board[row][col].isOpen;
}

// Flag를 놓는다. (범위체크 후, 이미 open된것은 pass)
export function setFlag(board: Board, row: number, col: number): void {}

// Flag를 푼다. (범위체크 후, 이미 open된것은 pass)
export function removeFlag(board: Board, row: number, col: number): void {}

// cell을 open한다. (범위체크 후)
export function openCell(board: Board, row: number, col: number): void {
  board[row][col].isOpen = true;
}

// 지뢰인지 판별한다. (범위체크 후)
export function checkBombCell(board: Board, row: number, col: number): boolean {
  if (!checkValidCell(board, row, col)) return false; // 범위 초과
  return board[row][col].isBomb;
}

// 주변의 지뢰 수를 센다 (범위체크 후, 자기가 지뢰가 아니면, 8방위를 다 센다)
export function countAdjacentBombs(
  board: Board,
  row: number,
  col: number
): number {
  // 내부함수 정의
  const cntBomb = (row: number, col: number) => {
    if (!checkValidCell(board, row, col)) return 0;
    return checkBombCell(board, row, col) ? 1 : 0;
  };

  const dr = [-1, 1, 0, 0, -1, -1, 1, 1]; // 상 하 좌 우 좌상 우상 좌하 우하
  const dc = [0, 0, -1, 1, -1, 1, -1, 1];
  let cnt = 0;
  for (let i = 0; i < dr.length; i++) {
    cnt += cntBomb(row + dr[i], col + dc[i]);
  }

  return cnt;
}
// 주변에 지뢰가 없는 칸들이 있을 경우 연쇄적으로 연다.
export function openAllCellsWithoutAdjacentBombs(
  board: Board,
  row: number,
  col: number,
  visited: { [key: string]: true } = {}
) {
  if (visited[`${row},${col}`]) return;
  if (!checkValidCell(board, row, col)) return;
  if (checkOpened(board, row, col)) return;
  // 지뢰를 열어버릴 경우
  if (checkBombCell(board, row, col)) {
    openCell(board, row, col); // 지뢰블럭 연다 (잘가)
    return;
  }
  // 그대로 숫자 당첨 (혼자 엶)
  if (board[row][col].number > 0) {
    openCell(board, row, col);
    return;
  }
  // 자기 자신 엶 (0일 것이다.)
  openCell(board, row, col);
  const dr = [-1, 1, 0, 0, -1, -1, 1, 1]; // 상 하 좌 우 좌상 우상 좌하 우하
  const dc = [0, 0, -1, 1, -1, 1, -1, 1];
  for (let i = 0; i < dr.length; i++) {
    openAllCellsWithoutAdjacentBombs(board, row + dr[i], col + dc[i], {
      ...visited,
      [`${row},${col}`]: true,
    });
  }
}
