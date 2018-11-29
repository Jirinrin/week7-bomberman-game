import React, { Component } from 'react';
import './Board.css'
import KeyboardEventHandler from 'react-keyboard-event-handler'


// this.props.board.map((row, i) => {
//   return row.map((cell, j) => {
//     ...
//   })
// })

class Board extends Component {
  state = {  }

  componentDidMount() {
    return;
  }

  renderCel = (rowIndex, cellIndex, symbol, hasTurn) => {
    return (
      <button
        className="board-tile"
        disabled={hasTurn}
        
        key={`${rowIndex}-${cellIndex}`}
      >{symbol || '.'}</button>
    )
  }

  render() {
    
    return ( <div>
      {!this.props.dead && !this.props.finished && <KeyboardEventHandler handleKeys={['right', 'down', 'left', 'up', 'z']} onKeyEvent={(key) => this.props.arrowMove(key)} /> }
  
  
      {this.props.board.map((cells, rowIndex) => 
        <div key={rowIndex}>
          {cells.map((symbol, cellIndex) => this.renderCel(rowIndex, cellIndex, symbol, false))} 
        </div>
      )}
    </div> );
  }
}

export default Board;