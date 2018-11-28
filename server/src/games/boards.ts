import { Board, Row } from "./entities";

export const emptyBoardPre: Board = [
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null, '▩',  null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
]

export const filledBoardPre = [
  [null,      null,      null,      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,      null,      null     ],
  [null,      '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       null     ],
  [null,      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, null     ],
  [undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined],
  [null,      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, null     ],
  [null,      '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       undefined, '▩',       null     ],
  [null,      null,      null,      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,      null,      null     ],
]

function spamBlocks(board): Board {
  return board.map(row => row.map(cell => {
    if (cell === undefined) return blockOrNot() ? '□' : null;
    else return cell;
  }));
}

function makeEdges(board: Board): Board {
  const filledRow = Array(board[0].length+2).fill('▣');
  let newBoard = [filledRow];
  board.forEach((row: Row) => newBoard.push(['▣', ...row, '▣']));
  newBoard.push(filledRow);

  return newBoard;
}

function blockOrNot(): boolean {
  return Math.random() < 0.8;
}

export const getBoard = (): Board => makeEdges(spamBlocks(filledBoardPre));

export const defaultBoard = makeEdges(spamBlocks(filledBoardPre));