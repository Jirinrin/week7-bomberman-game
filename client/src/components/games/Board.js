import React from 'react'
import './Board.css'
import KeyboardEventHandler from 'react-keyboard-event-handler'

const renderCel = (makeMove, rowIndex, cellIndex, symbol, hasTurn) => {
  return (
    <button
      className="board-tile"
      disabled={hasTurn}
      onClick={() => makeMove(rowIndex, cellIndex)}
      
      key={`${rowIndex}-${cellIndex}`}
    >{symbol || '-'}</button>
    
  )
}

export default ({board, makeMove}) => (<div>
    <KeyboardEventHandler handleKeys={['up']} onKeyEvent={(key, e) => console.log(`I pressed a ${key}`)} /> 
    <KeyboardEventHandler handleKeys={['down']} onKeyEvent={(key, e) => console.log(`I pressed a ${key}`)} /> 
    <KeyboardEventHandler handleKeys={['left']} onKeyEvent={(key, e) => console.log(`I pressed a ${key}`)} /> 
    <KeyboardEventHandler handleKeys={['down']} onKeyEvent={(key, e) => console.log(`I pressed a ${key}`)} /> 

  {board.map((cells, rowIndex) => 
    <div key={rowIndex}>
      {cells.map((symbol, cellIndex) => renderCel(makeMove, rowIndex, cellIndex,symbol,false))}
    </div>
  )}
</div>) 