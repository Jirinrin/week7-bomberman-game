import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, 
  Body, Patch 
} from 'routing-controllers';
import User from '../users/entity';
import { Game, Player, Board } from './entities';
import {isValidMove} from './logic';
// import { Validate } from 'class-validator';
import {io} from '../index';

class GameUpdate {

  // @Validate(IsBoard, {
  //   message: 'Not a valid board'
  // })
  board: Board;
}

@JsonController()
export default class GameController {

  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    const entity = await Game.create().save();

    await Player.create({
      game: entity, 
      user,
      symbol: 'x',
      position: [0, 0]
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
    /// moet dus (uiteindelijk) een aparte start game knop komen; dat game.status = 'started' moet dus niet direct gebeuren!
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`);

    game.status = 'started';
    await game.save();

    const player = await Player.create({
      game, 
      user,
      /// moet ook beter
      symbol: 'o',
      position: [10, 10]
    }).save();

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    });

    return player;
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
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

    // const winner = calculateWinner(update.board);
    // if (winner) {
    //   game.winner = winner;
    //   game.status = 'finished';
    // }
    // else if (finished(update.board)) {
    //   game.status = 'finished';
    // }
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
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch('/games/:id([0-9]+)/players')
  async updatePlayer(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() {position}: any
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });

    if (!isValidMove(position, game.board)) return player;

    if (!player) throw new ForbiddenError(`You are not part of this game`);
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`);

    player.position = position;
    await player.save();

    const updateId: number = player.id || 0;
    const newPlayers = game.players.map((pl) => pl.id === updateId ? player : pl );

    await game.save();
    
    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: {
        ...game,
        players: newPlayers
      }
    });

    return player;
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

