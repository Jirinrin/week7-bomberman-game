import React, { Component } from 'react';
import './Board.css';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Stage, Image, Layer} from 'react-konva';
import Konva from 'konva';
import xv2 from '../../images/xv2.jpg';

// this.props.board.map((row, i) => {
//   return row.map((cell, j) => {
//     <Image x={j*50} y={i*50} width={50} height={50} src={reference[cell]} />
//   })
// })

const reference = [
  '-', '|', '+', '<', '>', '^', 'v',
  '▩', '□', '▣', '💣',
  'x>', 'x<', 'x^', 'xv',
  'o>', 'o<', 'o^', 'ov',
  '☆>', '☆<', '☆^', '☆v',
  'ᗣ>', 'ᗣ<', 'ᗣ^', 'ᗣv',
];

class Board extends Component {
  state = {
    images: {},
    board: [[]],
    backgroundImage: null
  }

  async componentDidMount() {
    const newImages = {}
    
    reference.forEach(symbol => {
      const image = new window.Image();
      image.src = require(`../../images/${symbol}.jpg`);
      newImages[symbol] = image;
    });

    const backgroundImg = new window.Image();
    backgroundImg.src = xv2;

    await this.setState({
      images: newImages,
      backgroundImage: backgroundImg
    });

    console.log(this.state.images);
    this.setState({
      board: this.props.board.map((row, i) => {
        return row.map((cell, j) => {
          if (!this.state.images[cell]) return null;
          return <Image key={`${i}-${j}`} x={j * 50} y={i * 50} width={50} height={50} image={this.state.images[cell]} space={'fill'} />
        });
      })
    })
    
  }

  // componentDidUpdate(oldProps) {
  //   // if (JSON.stringify(this.props.board) !== JSON.stringify(oldProps.board)) {
  //   //   const diff = oldProps.board.map((row, i) => {
  //   //     return row.map((cell, j) => {
  //   //       if (cell === oldProps.board[j][i]) return null;
  //   //       if (cell === null && cell !== oldProps.board[j][i]) return [{type: 'add', symbol: cell, position: [j, i]}];
  //   //       if (cell !== null) {
  //   //         if (oldProps.board[j][i] === null) return [{type: 'remove', position: [j, i]}];
  //   //         else return [ {type: 'remove', position: [j, i]},
  //   //                       {type: 'add', symbol: cell, position: [j, i]} ]
  //   //       }
  //   //       return null;
  //   //     })
  //   //   }).filter(row => row.filter(cell => cell !== null));

  //     console.log(diff);

  //     let newBoard = this.state.board;
      
  //     // diff.forEach()
  //     // verander nieuwe board met alle dingen

  //     // in geval van add als er een animatie is speel dan die animatie af bovenop het standaard spul!

  //     // setstate om het te updaten
  //   }
  // }

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
    // console.log(this.state.board)
    return ( <div>
      {!this.props.dead && !this.props.finished && <KeyboardEventHandler handleKeys={['right', 'down', 'left', 'up', 'z']} onKeyEvent={(key) => this.props.arrowMove(key)} /> }
  
  
      <Stage width={950} height={850}>
        
        <Layer>
          <Image x={0} y={0} width={950} height={850} image={this.state.backgroundImage || null} space={'fill'} />          
        </Layer>

        <Layer>
          {this.state.board}
        </Layer>

      </Stage>




      {this.props.board.map((cells, rowIndex) => 
        <div key={rowIndex}>
          {cells.map((symbol, cellIndex) => this.renderCel(rowIndex, cellIndex, symbol, false))} 
        </div>
      )}
    </div> );
  }
}

export default Board;