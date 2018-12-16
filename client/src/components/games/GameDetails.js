import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {getGames, joinGame, startGame, updateGame, placeBomb, fireFlame, updateCurrentPlayerPosition} from '../../actions/games';
import {getUsers} from '../../actions/users';
import Paper from 'material-ui/Paper';
import Board from './Board';
import './GameDetails.css';
const toUserId = require('../../jwt').userId;

class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  startGame = () => this.props.startGame(this.props.game.id);    

  arrowMove = (key) => {
    const {currentPlayer, game} = this.props;
    if (key === 'right') {
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] + 1 ], '>'); 
    }
    if (key === 'left') {
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] - 1 ], '<'); 
    }
    if (key === 'up') {
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0]- 1, currentPlayer.position[1]], '^'); 
    }
    if (key === 'down') {
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0] + 1, currentPlayer.position[1]], 'v'); 
    }
    if (key === 'z') {
      if (!(currentPlayer.activeBombs >= currentPlayer.stats.bombs)) {
        this.props.placeBomb(game.id, currentPlayer.position, currentPlayer.id);
      }
    }
    if (key === 'x') {
      this.props.fireFlame(game.id, currentPlayer.position, this.props.currentPlayer.facing); 
  }
  }

  render() {
    const {game, formattedBoard, users, authenticated, userId, currentPlayer} = this.props;

    if (!authenticated) return (
			<Redirect to="/login" />
		);

    if (game === null || users === null) return 'Loading...';
    if (!game) return 'Not found';

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0];

    return (<Paper className="outer-paper">
      <h1>Game #{game.id}</h1>

      <p>Status: {game.status}</p>

      {
        game.status === 'pending' && 
        game.players.map(p => p.userId).indexOf(userId) === -1 && 
        <button onClick={this.joinGame}>Join Game</button> 
      }

      {
        game.status === 'pending' && game.players.map(p => p.userId).indexOf(userId) > -1 &&
        game.players.find(player => player.userId === toUserId(this.props.currentUser.jwt)).symbol === 'x' &&
        <button onClick={this.startGame}>Start Game</button>
      }


      {
        game.status === 'pending' && <ul><h2> Current players: </h2> {game.players.map(player => <li key={player.userId}>{ Object.values(users).find(user => user.id === player.userId).email}</li>)} </ul>
      }

      {
        winner &&
        <h1>Winner: {users[winner].firstName}</h1>
      }

      <hr />

      {
        game.status !== 'pending' && <div> <h3> Players alive: {game.players.filter(player => player.dead === false).length} </h3>
        <Board board={formattedBoard} arrowMove={this.arrowMove} currentuserid={userId} game={game} dead={currentPlayer ? currentPlayer.dead : null} finished={game.status === 'finished'}/>
        </div>
      }
    </Paper>)
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && toUserId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users,
  currentPlayer: state.games && state.currentUser && state.games[props.match.params.id].status !== 'pending' && state.games[props.match.params.id].players.find(player => player.userId === toUserId(state.currentUser.jwt)),
  formattedBoard: formatBoard(state.games ? state.games[props.match.params.id] : null),
  currentUser: state.currentUser
});

const mapDispatchToProps = {
  getGames, getUsers, startGame, joinGame, updateGame, updateCurrentPlayerPosition, placeBomb, fireFlame
};

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails);

function formatBoard(game) {
  if (game === null) return null;
  let formattedBoard = game.board;
  
  if (game.activeExplosions[0]) {
    game.activeExplosions.forEach(explosion => {
      Object.entries(explosion.position).forEach(kv => {
        kv[1].forEach(ex => {
          const initialCell = formattedBoard[ex[0]][ex[1]]
          if ((kv[0] === '-' && explosionRef['-'].includes(initialCell)) || (kv[0] === '|' && explosionRef['|'].includes(initialCell))) {
            formattedBoard[ex[0]][ex[1]] = '+';
          }
          else if (initialCell === '+') formattedBoard[ex[0]][ex[1]] = '+';
          else if ((kv[0] === '>' || kv[0] === '<') && explosionRef[kv[0]].includes(initialCell)) formattedBoard[ex[0]][ex[1]] = '-';
          else if ((kv[0] === '^' || kv[0] === 'v') && explosionRef[kv[0]].includes(initialCell)) formattedBoard[ex[0]][ex[1]] = '|';
          else if ((kv[0] === '>' || kv[0] === '<') && explosionRef2[kv[0]].includes(initialCell)) formattedBoard[ex[0]][ex[1]] = '+';
          else if ((kv[0] === '^' || kv[0] === 'v') && explosionRef2[kv[0]].includes(initialCell)) formattedBoard[ex[0]][ex[1]] = '+';
          else formattedBoard[ex[0]][ex[1]] = kv[0];
        });
      });
    });
  }
  if (game.activeBombs[0]) {
    game.activeBombs.forEach(bomb => formattedBoard[bomb.position[0]][bomb.position[1]] = '💣');
  }
  if (game.activeFlames[0]) {
    game.activeFlames.forEach(flame => formattedBoard[flame.position[0]][flame.position[1]] = '@');
  }
  game.players.forEach(player => {if(!player.dead) formattedBoard[player.position[0]][player.position[1]] = player.symbol + player.facing});
  return formattedBoard;
}

const explosionRef = {
  '-': ['|', '^', 'v'],
  '|': ['-', '>', '<'],
  '>': ['-', '<'],
  '<': ['-', '>'],
  '^': ['|', 'v'],
  'v': ['|', '^']
};

const explosionRef2 = {
  '>': ['^', 'v'],
  '<': ['^', 'v'],
  '^': ['>', '<'],
  'v': ['>', '<']
}