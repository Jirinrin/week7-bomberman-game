import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {getGames, joinGame, startGame, updateGame, placeBomb, updateCurrentPlayerPosition} from '../../actions/games';
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
      console.log('move to right');
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] + 1 ]); 
    }
    if (key === 'left') {
      console.log('move to left');
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] - 1 ]); 
    }
    if (key === 'up') {
      console.log('move up');
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0]- 1, currentPlayer.position[1]]); 
    }
    if (key === 'down') {
      console.log('move to down');
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0] + 1, currentPlayer.position[1]]); 
    }
    if (key === 'z') {
      console.log('Place bomb');
      this.props.placeBomb(game.id, currentPlayer.position); 
    }
  }

  render() {
    const {game, formattedBoard, users, authenticated, userId, currentPlayer} = this.props;

    if (!authenticated) return (
			<Redirect to="/login" />
		);

    if (game === null || users === null) return 'Loading...';
    if (!game) return 'Not found';

    // const player = game.players.find(p => p.userId === userId);

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0];

      console.log(users)
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
        <p>Winner: {users[winner].firstName}</p>
      }

      <hr />

      {
        game.status !== 'pending' && <div> <h3> Players alive: {game.players.filter(player => player.dead === false).length} </h3>
        <Board board={formattedBoard} arrowMove={this.arrowMove} dead={currentPlayer ? currentPlayer.dead : null} finished={game.status === 'finished'}/>
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
  getGames, getUsers, startGame, joinGame, updateGame, updateCurrentPlayerPosition, placeBomb
};

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails);

function formatBoard(game) {
  if (game === null) return null;
  let formattedBoard = game.board;
  
  if (game.activeExplosions[0]) {
    game.activeExplosions.forEach(explosion => {
      console.log(explosion);
      Object.entries(explosion.position).forEach(kv => {
        kv[1].forEach(ex => {
          const initialCell = formattedBoard[ex[0]][ex[1]]
          if ((kv[0] === '-' && explosionRef['-'].includes(initialCell)) || (kv[0] === '|' && explosionRef['-'].includes(initialCell))) {
            formattedBoard[ex[0]][ex[1]] = '+';
          }
          else formattedBoard[ex[0]][ex[1]] = kv[0];
        });
      });
    });
  }
  if (game.activeBombs[0]) {
    game.activeBombs.forEach(bomb => formattedBoard[bomb.position[0]][bomb.position[1]] = '💣');
  }
  game.players.forEach(player => {if(!player.dead) formattedBoard[player.position[0]][player.position[1]] = player.symbol});
  return formattedBoard;
}

const explosionRef = {
  '-': ['|', '^', 'v'],
  '|': ['-', '>', '<'],
};