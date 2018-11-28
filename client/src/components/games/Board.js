import React from 'react'
import './Board.css'
import KeyboardEventHandler from 'react-keyboard-event-handler'

const renderCel = (rowIndex, cellIndex, symbol, hasTurn) => {
  return (
    <button
      className="board-tile"
      disabled={hasTurn}
      
      key={`${rowIndex}-${cellIndex}`}
    >{symbol || '-'}</button>
    
  )
}

// board.map((cells, rowIndex) => 
//     <div key={rowIndex}>
//       {cells.map((symbol, cellIndex) => renderCel(rowIndex, cellIndex, symbol, false))} 
//     </div>

export default ({board, arrowMove, dead}) => {
  console.log(dead);
  return (<div>
    {!dead && <KeyboardEventHandler handleKeys={['right', 'down', 'left', 'up', 'z']} onKeyEvent={(key) => arrowMove(key)} /> }


    {board.map((cells, rowIndex) => 
      <div key={rowIndex}>
        {cells.map((symbol, cellIndex) => renderCel(rowIndex, cellIndex, symbol, false))} 
      </div>
    )}
  </div>)

}