import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Index, OneToMany, ManyToOne } from 'typeorm';
import User from '../users/entity';

export type PlayerSymbol = 'x' | 'o';
export type Symbol = PlayerSymbol | 'Q' | '▩';
export type Row = (Symbol | null)[];
export type Board = Row[];
export type Position = [ number, number ];

type Status = 'pending' | 'started' | 'finished';

// const BOARD_SIZE = [17, 15];

// const emptyRow: Row = Array(BOARD_SIZE[0]).fill(null);
// const emptyBoard: Board = Array(BOARD_SIZE[1]).fill(emptyRow);

const emptyBoard2 = [
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

@Entity()
export class Game extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('json', {default: emptyBoard2})
  board: Board

  @Column('char', {length:1, nullable: true})
  winner: Symbol

  @Column('text', {default: 'pending'})
  status: Status

  // this is a relation, read more about them here:
  // http://typeorm.io/#/many-to-one-one-to-many-relations
  @OneToMany(_ => Player, player => player.game, {eager:true})
  players: Player[]
}

@Entity()
@Index(['game', 'user', 'symbol'], {unique:true})
export class Player extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @ManyToOne(_ => User, user => user.players)
  user: User

  @ManyToOne(_ => Game, game => game.players)
  game: Game

  @Column()
  userId: number

  @Column('char', {length: 1})
  symbol: PlayerSymbol

  @Column('json', {default: [0,0]})
  position: Position
}