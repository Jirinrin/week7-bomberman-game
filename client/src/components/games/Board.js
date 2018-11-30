import React, { Component } from 'react';
import './Board.css';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Stage, Image, Sprite, Layer, Rect} from 'react-konva';
import Konva, { Canvas } from 'konva';
import bg from '../../images/bg.png';
const gifler = require('gifler');

// this.props.board.map((row, i) => {
//   return row.map((cell, j) => {
//     <Image x={j*50} y={i*50} width={50} height={50} src={reference[cell]} />
//   })
// })

const reference = [
  '-', '|', '+', '<', '>', '^', 'v',
  '▩', '□', '▣', '▤', '💣',
  'x>', 'x<', 'x^', 'xv',
  'o>', 'o<', 'o^', 'ov',
  '☆>', '☆<', '☆^', '☆v',
  'ᗣ>', 'ᗣ<', 'ᗣ^', 'ᗣv',
];

const animations = {
  idle:   ['💣'],
  add:    ['-', '|', '+', '<', '>', '^', 'v'],
  remove: ['-', '|', '+', '<', '>', '^', 'v', '□'], /// en bom?
}

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
      image.src = require(`../../images/${symbol}.gif`);
      newImages[symbol] = image;
    });

    const backgroundImg = new window.Image();
    backgroundImg.src = bg;

    await this.setState({
      images: newImages,
      backgroundImage: backgroundImg
    });

    this.setState({
      board: this.props.board.map((row, i) => {
        return row.map((cell, j) => {
          if (!this.state.images[cell]) return null;
          return this.renderNewImg(cell, j * 50, i * 50);
        });
      })
    });
  }

  renderNewImg = (symbol, x, y) => {
    if (animations.idle.includes(symbol)) {
      return <Animation key={`${x}-${y}-${symbol}`} src={require(`../../images/${symbol}_i.gif`)} x={x} y={y} frameRate={13} type={'idle'} frames={4} />
    }
    if (animations.add.includes(symbol)) {
      return <Animation key={`${x}-${y}-${symbol}`} src={require(`../../images/${symbol}_a.gif`)} x={x} y={y} frameRate={13} type={'add'} frames={4} />
    }
    else {
      return <Image key={`${x}-${y}-${symbol}`} x={x} y={y} width={50} height={50} image={this.state.images[symbol]} space={'fill'} />
    }
  }

  componentWillUpdate(nextProps) {
    let force = null;
    if (JSON.stringify(nextProps.board) !== JSON.stringify(this.props.board)) {
      const diffs = this.props.board.map((row, i) => {
        return row.map((cell, j) => {
          if (cell === nextProps.board[i][j]) return null;
          if (cell === null && nextProps.board[i][j] !== null) return [{type: 'add', symbol: nextProps.board[i][j], pos: [i, j]}];
          if (cell !== null) {
            if (nextProps.board[i][j] === null) return [{type: 'remove', pos: [i, j]}];
            else return [ {type: 'remove', pos: [i, j]},
                          {type: 'add', symbol: nextProps.board[i][j], pos: [i, j]} ]
          }
          return null;
        })
      })
      .map(row => row.filter(cell => cell !== null))
      .filter(row => !!row[0])
      .flat(2)
      .sort((a, b) => a.type < b.type);

      console.log(diffs);

      let newBoard = this.state.board;
      
      diffs.forEach(diff => {
        switch (diff.type) {
          case 'remove':
            newBoard[diff.pos[0]][diff.pos[1]] = null;
            break;
          case 'add':
            newBoard[diff.pos[0]][diff.pos[1]] = this.renderNewImg(diff.symbol, diff.pos[1] * 50, diff.pos[0] * 50);
            break;
          default:
            return;
        }
      });

      this.setState({board: newBoard});
    }
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
    const testImg = new window.Image();
    testImg.src = require('../../images/💣_i.gif')

    return ( <div>
      {!this.props.dead && !this.props.finished && 
        <KeyboardEventHandler 
          handleKeys={['right', 'down', 'left', 'up', 'z']} 
          onKeyEvent={(key, e) => {
            e.preventDefault();
            this.props.arrowMove(key);
          }}
        />
      }
  
  
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

      {/* <div>
        <Stage width={950} height={850}>
          <Layer>
            <Sprite x={0} y={0} width={50} height={50} image={testImg} space={'fill'}
                    animation={'idle'} animations={{idle: [0,0,96,96, 96,0,96,96]}}
                    frameRate={7} frameIndex={0} />
            <Animation x={100} y={100} width={50} height={50} src={require('../../images/💣_i.gif')} frameRate={13} />
          </Layer>
        </Stage>
      </div> */}
    </div> );
  }
}

export default Board;


/// moet nog geexternaliseerd worden

class Animation extends Component {
  state = {
    image: new window.Image(),
    animations: {},
    currentAnimation: 'idle'
  };

  componentDidMount() {
    this.setState({animations: {
      idle: Array(this.props.frames).fill(null)
              .map((_, i) => [i*96, 0, 96, 96])
              .flat()
      }});
    
    this.state.image.src = this.props.src;
    this.state.image.onload = () => this.spriteNode.start();
  }

  componentWillUnmount() {
    this.spriteNode.destroy();
  }

  render() {
    return (
      <Sprite 
        key={`${this.props.x}-${this.props.y}`} x={this.props.x} y={this.props.y} scale={{x: 0.5208, y: 0.5208}} image={this.state.image} space={'fill'}
        animation={this.state.currentAnimation} animations={this.state.animations}
        frameRate={this.props.frameRate} frameIndex={0}
        ref={node => this.spriteNode = node}
      />
    );
  }
}