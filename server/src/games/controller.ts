import {
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get,
  Body, Patch
} from 'routing-controllers';
import User from '../users/entity';
import { Game, Player, Board, Bomb, Explosion, Flame, PowerupSymbol } from './entities';
import { isValidMove, calculateExplosion, playersAreDead, calculateWinner, hitByFlame, calculateFlamePos } from './logic';
import { io } from '../index';
import { getBoard } from './boards';

const BOMB_FUSE = 3000;
const FLAME_LAUNCH_FUSE = 100;
const FLAME_FUSE = 100;
const EXPLOSION_DURATION = 1500;

const ITEM_CHANCES = {
  'null': 5,
  'db^': 1,
  'dbv': 1,
  'df^': 2,
  'dfv': 1
};
const totalChance = Object.values(ITEM_CHANCES).reduce((acc, curr) => acc + curr);

let counter = 0;
const ITEM_DROP_MAP: { [num: number]: PowerupSymbol } = Object.keys(ITEM_CHANCES).reduce((acc, currentDrop) => {
  const newAcc = { ...acc, [currentDrop]: ITEM_CHANCES[currentDrop] / totalChance + counter - (1 / totalChance) }
  counter += ITEM_CHANCES[currentDrop] / totalChance;
  return newAcc;
}, {});

class GameUpdate {
  board: Board;
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  });
}

@JsonController()
export default class GameController {

  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    const entity = await Game.create({
      board: getBoard()
    }).save();

    await Player.create({
      game: entity,
      user,
      symbol: 'x',
      position: [1, 1]
    }).save();

    const game = await Game.findOneById(entity.id);

    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    });

    return game;
  }


  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new BadRequestError(`Game does not exist`);
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`);


    const player = Player.create({
      game,
      user
    })

    switch (game.players.length) {
      case 1:
        player.symbol = 'o';
        player.position = [15, 17];
        break;
      case 2:
        player.symbol = '☆';
        player.position = [1, 17];
        break;
      case 3:
        player.symbol = 'ᗣ';
        player.position = [15, 1];
        game.status = 'started';
        await game.save();
        break;
      default:
        throw new ForbiddenError(`Game is full`)
    }

    await player.save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(gameId)
    });

    return player;
  }



  @Authorized()
  @Patch('/games/:id([0-9]+)/start')
  @HttpCode(200)
  async startGame(
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new BadRequestError(`Game does not exist`);

    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`);
    game.status = 'started';
    await game.save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(gameId)
    });

    return game;
  }

  @Authorized()
  // Comment not added by us:
  // "the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens"
  @Patch('/games/:id([0-9]+)')
  async updateGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() update: GameUpdate
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });

    if (!player) throw new ForbiddenError(`You are not part of this game`);
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`);

    game.board = update.board;
    await game.save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: game
    });

    return game;
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  @Patch('/games/:id([0-9]+)/players')
  async updatePlayer(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() { position, facing }: any
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });

    if (!player) throw new ForbiddenError(`You are not part of this game`);
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`);

    if (!isValidMove(position, game)) {
      if (player.facing === facing) return player;
    }
    else player.position = position;
    player.facing = facing;

    if (Object.keys(ITEM_CHANCES).includes(game.board[player.position[0]][player.position[1]]!)) {
      switch (game.board[player.position[0]][player.position[1]]) {
        case 'db^':
          player.stats.bombs = player.stats.bombs + 1;
          break;
        case 'dbv':
          player.stats.bombs = player.stats.bombs - 1 || 1;
          break;
        case 'df^':
          player.stats.power = player.stats.power + 1;
          break;
        case 'dfv':
          player.stats.power = player.stats.power - 1 || 1;
      }
      game.board[player.position[0]][player.position[1]] = null;
      await game.save();
    }

    await player.save();

    const updateId: number = player.id || 0;
    const newPlayers = game.players.map((pl) => pl.id === updateId ? player : pl);

    let gameAfterPositionUpdate: Game = { ...game, players: newPlayers } as Game;

    const gameAfterDeadPlayers = await checkForDeadPlayers(gameAfterPositionUpdate, gameId);
    if (gameAfterDeadPlayers) gameAfterPositionUpdate = gameAfterDeadPlayers;

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: gameAfterPositionUpdate
    });

    return player;
  }


  @Authorized()
  @Post('/games/:id([0-9]+)/bombs')
  async placeBomb(
    @Param('id') gameId: number,
    @Body() { position, playerId }: any
  ) {
    const game = await Game.findOneById(gameId);
    let player = await Player.findOneById(playerId);
    if (!game || !player) throw new NotFoundError(`Game or player does not exist`);

    player.activeBombs = player.activeBombs + 1;
    await player.save();

    // Place bomb

    const newBomb: Bomb = await Bomb.create({
      game,
      position,
      power: player.stats.power
    }).save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: {
        ...game,
        activeBombs: [
          ...game.activeBombs,
          newBomb
        ]
      }
    });

    // Bomb explodes

    setTimeout(async () => {
      let updatedPlayer = await Player.findOneById(playerId) as Player;
      updatedPlayer.activeBombs = updatedPlayer.activeBombs - 1;
      await updatedPlayer.save();

      await newBomb.remove();
      const updateAfterBomb = await Game.findOneById(gameId);

      const newExplosion: Explosion = await Explosion.create({
        game: updateAfterBomb,
        position: calculateExplosion(position, updateAfterBomb!, updatedPlayer.stats.power)
      }).save();

      let gameDuringExplosion: Game = await Game.findOneById(gameId) as Game;

      const gameAfterDeadPlayers = await checkForDeadPlayers(gameDuringExplosion, gameId);
      if (gameAfterDeadPlayers) gameDuringExplosion = gameAfterDeadPlayers;

      Object.values(newExplosion.position).forEach(positions => {
        positions.forEach(pos => {
          if (gameDuringExplosion.board[pos[0]][pos[1]] === '□') {
            const randomNo = Math.random();
            try {
              Object.entries(ITEM_DROP_MAP).reverse().forEach((kv, i) => {
                if (kv[0] === 'null' || i === Object.keys(ITEM_DROP_MAP).length-1) throw null;
                else if (randomNo > Number(kv[1])) {
                  throw kv[0];
                }
              });
            }
            catch (value) {
              gameDuringExplosion.board[pos[0]][pos[1]] = value;
            }
          }
          else gameDuringExplosion.board[pos[0]][pos[1]] = null;
        });
      });

      await gameDuringExplosion.save();

      io.emit('action', {
        type: 'UPDATE_GAME',
        payload: gameDuringExplosion
      })

      await sleep(EXPLOSION_DURATION);

      // Explosion finished
      
      await newExplosion.remove();
      const updateAfterExplosion = await Game.findOneById(gameId);

      io.emit('action', {
        type: 'UPDATE_GAME',
        payload: updateAfterExplosion
      });

    }, BOMB_FUSE);

    return newBomb;
  }



  @Authorized()
  @Post('/games/:id([0-9]+)/flames')
  async fireFlames(
    @Param('id') gameId: number,
    @Body() { position, facing }: any
  ) {
    let game = await Game.findOneById(gameId);
    if (!game) throw new NotFoundError(`Game does not exist`);

    let newPosition = calculateFlamePos(position, game, facing)

    if (!newPosition) return null

    const newFlame: Flame = await Flame.create({
      game,
      position: newPosition
    }).save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: {
        ...game,
        activeFlames: [
          ...game.activeFlames,
          newFlame
        ]
      }
    });

    setTimeout(async () => {
      while (calculateFlamePos(newFlame.position, game, facing) && !hitByFlame(newPosition, game)) {
        game = await Game.findOneById(gameId);
        newPosition = calculateFlamePos(newFlame.position, game, facing)

        newFlame.position = newPosition
        await newFlame.save()
        game = await Game.findOneById(gameId);
        io.emit('action', {
          type: 'UPDATE_GAME',
          payload: game

        });
        await sleep(FLAME_FUSE);
      }


      const gameAfterHitPlayers = await checkForDeadPlayers(game!, gameId);
      if (gameAfterHitPlayers) {
        game = gameAfterHitPlayers;
        io.emit('action', {
          type: 'UPDATE_GAME',
          payload: game
        })
      }

      await newFlame.remove();

      game = await Game.findOneById(gameId) as Game;

      io.emit('action', {
        type: 'UPDATE_GAME',
        payload: game
      });
    }, FLAME_LAUNCH_FUSE)
    return newFlame;
  }

  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame(
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }

  @Authorized()
  @Get('/games')
  getGames() {
    return Game.find()
  }
}

async function checkForDeadPlayers(game: Game, gameId: number): Promise<Game | null> {
  const deadPlayers = playersAreDead(game);
  let gameCopy: Game = game;
  if (deadPlayers) {
    deadPlayers.forEach(async player => {
      player.dead = true;
      gameCopy.players = gameCopy.players.map(pl => JSON.stringify(pl) === JSON.stringify(player) ? player : pl);
      await player.save();
    });

    await gameCopy.save();

    const winner = calculateWinner(game);
    if (winner) {
      let finishedGame = await Game.findOneById(gameId) as Game;
      finishedGame.winner = winner.symbol;
      finishedGame.status = 'finished';
      await finishedGame.save();
      return finishedGame;
    }
    else if (winner === false) {
      let finishedGame = await Game.findOneById(gameId) as Game;
      finishedGame.status = 'finished';
      await finishedGame.save();
      return finishedGame;
    }
    else return gameCopy;
  }
  else return null;
}