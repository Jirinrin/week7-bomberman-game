import { Position, Game, ExplosionPos, Player } from './entities'

const DESTRUCTABLE = ['□'];
const STURDY = ['▩', '▣'];
const OBSTACLES = [...DESTRUCTABLE, ...STURDY];

export const isValidMove = (newPosition: Position, game: Game): boolean => {
  if ((game.board[newPosition[0]][newPosition[1]] && OBSTACLES.includes(game.board[newPosition[0]][newPosition[1]]!)) ||
      game.activeBombs.find(bomb => JSON.stringify(bomb.position) === JSON.stringify(newPosition)) ||
      game.players.find(player => JSON.stringify(player.position) === JSON.stringify(newPosition) && !player.dead)
    ) {
    return false;
  }
  return true;
}

export const calculateExplosion = (startPoint: Position, game: Game, size: number): ExplosionPos => {
  let newExplosion: ExplosionPos = { '+': [startPoint], 
                                     '-': [], '|': [],
                                     '>': [], '<': [],
                                     '^': [], 'v': [] };

  newExplosion['-'] = [
    ...calculateExpLine(startPoint, game, 1, '-', size)
        .filter((pos, i, arr) => {
          if (i >= arr.length - 1) {
            newExplosion['>'].push(pos);
            return false;
          }
          return true;
        }),
    ...calculateExpLine(startPoint, game, -1, '-', size)
        .filter((pos, i, arr) => {
          if (i >= arr.length - 1) {
            newExplosion['<'].push(pos);
            return false;
          }
          return true;
        }),
  ];

  newExplosion['|'] = [
    ...calculateExpLine(startPoint, game, 1, '|', size)
        .filter((pos, i, arr) => {
          if (i >= arr.length - 1) {
            newExplosion['v'].push(pos);
            return false;
          }
          return true;
        }),
    ...calculateExpLine(startPoint, game, -1, '|', size)
        .filter((pos, i, arr) => {
          if (i >= arr.length - 1) {
            newExplosion['^'].push(pos);
            return false;
          }
          return true;
        }),
  ];

  return newExplosion;
}

export const calculateExpLine = (startPoint: Position, game: Game, step: 1|-1, direction: '|'|'-', size: number): Position[] => {
  const newLine: Position[] = [];
  switch (direction) {
    case '-':
      for (let i = 0; i < size; i++) {
        if (game.activeBombs.some(bomb => JSON.stringify(bomb.position) === JSON.stringify([startPoint[0], startPoint[1]+(step*(i+1))]))) {
          break;
        }
        if (game.board[startPoint[0]][startPoint[1]+(step*(i+1))] && STURDY.includes(game.board[startPoint[0]][startPoint[1]+(step*(i+1))]!)) {
          break;
        }
        else if ((game.board[startPoint[0]][startPoint[1]+(step*(i+1))] && DESTRUCTABLE.includes(game.board[startPoint[0]][startPoint[1]+(step*(i+1))]!))) {
          newLine.push([startPoint[0], startPoint[1]+(step*(i+1))]);
          break;
        }
        else {
          newLine.push([startPoint[0], startPoint[1]+(step*(i+1))]);
        }
      }
      break;
    case '|':
      for (let i = 0; i < size; i++) {
        if (game.activeBombs.some(bomb => JSON.stringify(bomb.position) === JSON.stringify([startPoint[0]+(step*(i+1)), startPoint[1]]))) {
          break;
        }
        if (game.board[startPoint[0]+(step*(i+1))][startPoint[1]] && STURDY.includes(game.board[startPoint[0]+(step*(i+1))][startPoint[1]]!)) {
          break;
        }
        else if ((game.board[startPoint[0]+(step*(i+1))][startPoint[1]] && DESTRUCTABLE.includes(game.board[startPoint[0]+(step*(i+1))][startPoint[1]]!))) {
          newLine.push([startPoint[0]+(step*(i+1)), startPoint[1]]);
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

    if (JSON.stringify(game.activeFlames).split('game')[0].includes(JSON.stringify(player.position))) {
      deadPlayers.push(player);
    }

  }
  return deadPlayers[0] ? deadPlayers : null;
}

export const calculateWinner = (game: Game): Player | null | false => {
  const alivePlayers = game.players.filter(player => !player.dead);
  if (alivePlayers.length === 1) return alivePlayers[0];
  if (alivePlayers.length === 0) return false
  return null;
}

export const calculateFlamePos = (currentPosition, game, facing) => {
  
  let newPosition
  switch (facing) {
    case '>': 
      newPosition = [currentPosition[0], currentPosition[1]+1]
      if(STURDY.includes(game.board[newPosition[0]][newPosition[1]]) || DESTRUCTABLE.includes(game.board[newPosition[0]][newPosition[1]])) return null
    break;
    case '<':
      newPosition = [currentPosition[0], currentPosition[1]-1]
      if(STURDY.includes(game.board[newPosition[0]][newPosition[1]]) || DESTRUCTABLE.includes(game.board[newPosition[0]][newPosition[1]])) return null
    break;
    case '^':
      newPosition = [currentPosition[0]-1, currentPosition[1]]
      if(STURDY.includes(game.board[newPosition[0]][newPosition[1]]) || DESTRUCTABLE.includes(game.board[newPosition[0]][newPosition[1]])) return null
    break;
    case 'v':
      newPosition = [currentPosition[0]+1, currentPosition[1]]
      if(STURDY.includes(game.board[newPosition[0]][newPosition[1]]) || DESTRUCTABLE.includes(game.board[newPosition[0]][newPosition[1]])) return null
    break;
    default:
      break;
 }
 return newPosition
}

export const hitByFlame = (flamePosition, game) => {
  if(game.players.find(player => JSON.stringify(player.position) === JSON.stringify(flamePosition))) {
    const hitPlayer = game.players.find(player => JSON.stringify(player.position) === JSON.stringify(flamePosition))
    return hitPlayer
  }
  if (game.activeBombs.find(bomb => JSON.stringify(bomb.position) === JSON.stringify(flamePosition))) {
    const bombPosition = game.activeBombs.find(bomb => JSON.stringify(bomb.position) === JSON.stringify(flamePosition))
    return bombPosition
  }
  return false
}