export type Cell = {
  isFlag: boolean;
  isOpen: boolean;
  number: number;
  isBomb: boolean;
};

export type Board = Cell[][];

const dr = [-1, 1, 0, 0, -1, -1, 1, 1]; // 상 하 좌 우 좌상 우상 좌하 우하
const dc = [0, 0, -1, 1, -1, 1, -1, 1];

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
export function setFlag(board: Board, row: number, col: number): void {
  // 이미 연 박스는 냅둔다.
  if (checkOpened(board, row, col)) {
    return;
  }
  board[row][col].isFlag = true;
}

// Flag를 푼다. (범위체크 후, 이미 open된것은 pass)
export function removeFlag(board: Board, row: number, col: number): void {
  // 이미 연 박스는 냅둔다.
  if (checkOpened(board, row, col)) {
    return;
  }
  board[row][col].isFlag = false;
}

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
  // 깃발은 패싱한다. (사용자의 판단이므로 +-+)
  if (board[row][col].isFlag) return;
  // 지뢰를 열어버릴 경우
  if (checkBombCell(board, row, col)) {
    console.log("플래그 잘못 세우고 지뢰를 연거 같아요.");
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
  for (let i = 0; i < dr.length; i++) {
    openAllCellsWithoutAdjacentBombs(board, row + dr[i], col + dc[i], {
      ...visited,
      [`${row},${col}`]: true,
    });
  }
}

// 지뢰 1개를 놓는다.
function putBomb(board: Board, row: number, col: number) {
  if (checkBombCell(board, row, col)) return;
  board[row][col].isBomb = true;

  for (let i = 0; i < dr.length; i++) {
    if (checkBombCell(board, row + dr[i], col + dc[i])) continue;
    if (!checkValidCell(board, row + dr[i], col + dc[i])) continue;
    board[row + dr[i]][col + dc[i]].number = countAdjacentBombs(
      board,
      row + dr[i],
      col + dc[i]
    );
  }
}

// 지뢰를 제거한다.
function removeBomb(board: Board, row: number, col: number) {
  if (!checkBombCell(board, row, col)) return;
  board[row][col].isBomb = false;
  for (let i = 0; i < dr.length; i++) {
    if (checkBombCell(board, row + dr[i], col + dc[i])) continue;
    if (!checkValidCell(board, row + dr[i], col + dc[i])) continue;

    board[row + dr[i]][col + dc[i]].number = countAdjacentBombs(
      board,
      row + dr[i],
      col + dc[i]
    );
  }
}

export function firstHandicap(board: Board, row: number, col: number) {
  const randomIdxFactory = () => Math.floor(Math.random() * board.length);
  while (true) {
    const newRow = randomIdxFactory();
    const newCol = randomIdxFactory();
    if (
      row !== newRow &&
      col !== newCol &&
      board[newRow][newCol].isBomb === false
    ) {
      removeBomb(board, row, col);
      putBomb(board, newRow, newCol);
      break;
    }
  }
}

// 주변 8개에서 확실히 열 수 있는 블록의 [row, col] 쌍을 리턴받는다. (플래그)
// 주변 플래그 수 === 자기 개수이면 open된것들을 다 열어도 됨.
export function canOpenAdjs(board: Board, row: number, col: number) {
  const ret = [];
  const myNum = board[row][col].number;
  let cnt = 0;
  for (let i = 0; i < dr.length; i++) {
    if (!checkValidCell(board, row + dr[i], col + dc[i])) continue;
    if (board[row + dr[i]][col + dc[i]].isFlag) {
      cnt++;
    } else if (!board[row + dr[i]][col + dc[i]].isOpen) {
      ret.push([row + dr[i], col + dc[i]]);
    }
  }
  // cnt가 더 적은 경우는 사용자가 이상하게 깃발을 쳤을 때이다.
  // 모르는 블록이 더 많으면 열지 않는다.
  if (cnt === myNum) {
    return ret;
  }
  return [];
}
