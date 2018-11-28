import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {getGames, joinGame, updateGame, placeBomb, updateCurrentPlayerPosition} from '../../actions/games';
import {getUsers} from '../../actions/users';
import {userId} from '../../jwt';
import Paper from 'material-ui/Paper';
import Board from './Board';
import './GameDetails.css';

class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  componentDidUpdate() {
    console.log(this.props.currentPlayer);
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  arrowMove = (key) => {
    const {currentPlayer, game} = this.props
    if(key === 'right') {
      console.log('move to right')
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] + 1 ]) 
    }
    if(key === 'left') {
      console.log('move to left')
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0], currentPlayer.position[1] - 1 ]) 
    }
    if(key === 'up') {
      console.log('move up')
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0]- 1, currentPlayer.position[1]]) 
    }
    if(key === 'down') {
      console.log('move to down')
      this.props.updateCurrentPlayerPosition(game.id, [currentPlayer.position[0] + 1, currentPlayer.position[1]]) 
    }
    if(key === 'z') {
      console.log('Place bomb')
      this.props.placeBomb(game.id, currentPlayer.position) 
    }
  }




  render() {
    const {game, formattedBoard, users, authenticated, userId, currentPlayer} = this.props;

    if (!authenticated) return (
			<Redirect to="/login" />
		);

    if (game === null || users === null) return 'Loading...';
    if (!game) return 'Not found';

    const player = game.players.find(p => p.userId === userId);

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
        winner &&
        <p>Winner: {users[winner].firstName}</p>
      }

      <hr />

      {
        game.status !== 'pending' &&
        <Board board={formattedBoard} arrowMove={this.arrowMove} dead={currentPlayer.dead} finished={game.status === 'finished'}/>
      }
    </Paper>)
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users,
  currentPlayer: state.games && state.currentUser && state.games[props.match.params.id].status !== 'pending' && state.games[props.match.params.id].players.find(player => player.userId === userId(state.currentUser.jwt)),
  formattedBoard: formatBoard(state.games ? state.games[props.match.params.id] : null),
  /// weghalen en beter ofzo
});

const mapDispatchToProps = {
  getGames, getUsers, joinGame, updateGame, updateCurrentPlayerPosition, placeBomb
};

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails);

function formatBoard(game) {
  if (game === null) return null;
  let formattedBoard = game.board;
  if (game.activeBombs[0]) {
    game.activeBombs.forEach(bomb => formattedBoard[bomb.position[0]][bomb.position[1]] = '💣');
  }
  game.players.forEach(player => {if(!player.dead) formattedBoard[player.position[0]][player.position[1]] = player.symbol});
  if (game.activeExplosions[0]) {
    game.activeExplosions.forEach(explosion => {
      explosion.position['+'].forEach(ex => formattedBoard[ex[0]][ex[1]] = '+')
      explosion.position['-'].forEach(ex => formattedBoard[ex[0]][ex[1]] = '—')
      explosion.position['|'].forEach(ex => formattedBoard[ex[0]][ex[1]] = '|')
    });
  }
  return formattedBoard;
}