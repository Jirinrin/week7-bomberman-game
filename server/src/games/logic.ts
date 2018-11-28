// import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { Position, Game, ExplosionPos, Player } from './entities'

const OBSTACLES = ['▩', '□', '▣']
const EXPLOSION_SIZE = 3;

export const isValidMove = (newPosition: Position, game: Game): boolean => {
  if ((game.board[newPosition[0]][newPosition[1]] && OBSTACLES.includes(game.board[newPosition[0]][newPosition[1]]!)) ||
      game.activeBombs.find(bomb => JSON.stringify(bomb.position) === JSON.stringify(newPosition))
    ) {
    return false;
  }
  return true;
}

export const calculateExplosion = (startPoint: Position, game: Game): ExplosionPos => {
  
  let newExplosion: ExplosionPos = { '+': [startPoint], '-': [], '|': [] };

  newExplosion['-'] = [
    ...calculateExpLine(startPoint, game, 1, '-', EXPLOSION_SIZE),
    ...calculateExpLine(startPoint, game, -1, '-', EXPLOSION_SIZE)
  ];

  newExplosion['|'] = [
    ...calculateExpLine(startPoint, game, 1, '|', EXPLOSION_SIZE),
    ...calculateExpLine(startPoint, game, -1, '|', EXPLOSION_SIZE)
  ];

  return newExplosion;
}

export const calculateExpLine = (startPoint: Position, game: Game, step: 1|-1, direction: '|'|'-', size: number): Position[] => {
  const newLine: Position[] = [];
  switch (direction) {
    case '-':
      for (let i = 0; i < size; i++) {
        if (game.board[startPoint[0]][startPoint[1]+(step*(i+1))] && OBSTACLES.includes(game.board[startPoint[0]][startPoint[1]+(step*(i+1))]!)) {
          break;
        }
        else {
          newLine.push([startPoint[0], startPoint[1]+(step*(i+1))]);  
        }
      }
      break;
    case '|':
      for (let i = 0; i < size; i++) {
        if (game.board[startPoint[0]+(step*(i+1))][startPoint[1]] && OBSTACLES.includes(game.board[startPoint[0]+(step*(i+1))][startPoint[1]]!)) {
          break;
        }
        else {
          newLine.push([startPoint[0]+(step*(i+1)), startPoint[1]]);  
        }
      }
    default:
      break;
  }
  return newLine;
}



export const playersAreDead = (game: Game): Player[] | null => { 
  let deadPlayers: Player[] = [];
  for (let player of game.players) {
    
    if (JSON.stringify(game.activeExplosions).split('game')[0].includes(JSON.stringify(player.position))) {
      deadPlayers.push(player);
    }
  }
  return deadPlayers[0] ? deadPlayers : null;
}

export const calculateWinner = (game: Game): Player | null => {
  const alivePlayers = game.players.filter(player => !player.dead);
  if (alivePlayers.length === 1) return alivePlayers[0];
  // if (alivePlayers.length === 0 return meh)
  return null;
}

// @ValidatorConstraint()
// export class IsBoard implements ValidatorConstraintInterface {

//   validate(board: Board) {
//     const symbols = [ 'x', 'o', null ]
//     return board.length === 3 &&
//       board.every(row =>
//         row.length === 3 &&
//         row.every(symbol => symbols.includes(symbol))
//       )
//   }
// }

// export const isValidTransition = (playerSymbol: Symbol, from: Board, to: Board) => {
//   const changes = from
//     .map(
//       (row, rowIndex) => row.map((symbol, columnIndex) => ({
//         from: symbol, 
//         to: to[rowIndex][columnIndex]
//       }))
//     )
//     .reduce((a,b) => a.concat(b))
//     .filter(change => change.from !== change.to)

//   return changes.length === 1 && 
//     changes[0].to === playerSymbol && 
//     changes[0].from === null
// }

// export const calculateWinner = (board: Board): Symbol | null =>
//   board
//     .concat(
//       // vertical winner
//       [0, 1, 2].map(n => board.map(row => row[n])) as Row[]
//     )
//     .concat(
//       [
//         // diagonal winner ltr
//         [0, 1, 2].map(n => board[n][n]),
//         // diagonal winner rtl
//         [0, 1, 2].map(n => board[2-n][n])
//       ] as Row[]
//     )
//     .filter(row => row[0] && row.every(symbol => symbol === row[0]))
//     .map(row => row[0])[0] || null

// export const finished = (board: Board): boolean =>
//   board
//     .reduce((a,b) => a.concat(b) as Row)
//     .every(symbol => symbol !== null)