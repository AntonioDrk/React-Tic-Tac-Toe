import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className={`square col-4 ${this.props.winState}`}
        onClick={() => this.props.onClick()}>
        {this.props.value}
      </button>
    );
  }
}

class GameState {
  constructor() {
    this.winState = Array(9).fill(null);
    this.squares = Array(9).fill(null);
    this.turn = 'X';
    this.winner = null;
    this.status = 'Next player: X';
  }
}

class Board extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     winState: Array(9).fill(null),
  //     squares: Array(9).fill(null),
  //     turn: 'X',
  //     winner: null,
  //     status: 'Next player: X'
  //   }
  // }

  renderSquare(i) {
    return (<Square
      winState={this.props.gState.winState[i] ? "winSquare" : " "}
      value={this.props.gState.squares[i]}
      onClick={() => this.props.onClick(i)}
    />
    );
  }

  render() {
    return (
      <div className="container-fluid pt-3 mb-5">
        <div className="board-row row g-0 align-items-center">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row row g-0 align-items-center">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row row g-0 align-items-center">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        new GameState()
      ],
      historyIndex: 0,
    }
  }

  // Checks if the future configuration is a winning one and returns an array of the winning squares if so
  // Otherwise returns null
  isWinning(gameState) {
    let squares = gameState.squares;
    let winnerIndexes = [];
    // Horizontal + Vertical Checks
    for (let i = 0; i < squares.length; i += 3) {
      if (
        squares[i] &&
        squares[i] === squares[i + 1] &&
        squares[i] === squares[i + 2] &&
        squares[i + 1] === squares[i + 2]) {
        winnerIndexes.push(i);
        winnerIndexes.push(i + 1);
        winnerIndexes.push(i + 2);
      }
      if (squares[i / 3] &&
        squares[i / 3] === squares[i / 3 + 3] &&
        squares[i / 3] === squares[i / 3 + 6] &&
        squares[i / 3 + 3] === squares[i / 3 + 6]
      ) {
        winnerIndexes.push(i / 3);
        winnerIndexes.push(i / 3 + 3);
        winnerIndexes.push(i / 3 + 6);
      }
    }
    // Diagonals
    if (squares[0] &&
      squares[0] === squares[4] &&
      squares[0] === squares[8] &&
      squares[4] === squares[8]) {
      winnerIndexes.push(0);
      winnerIndexes.push(4);
      winnerIndexes.push(8);

    }
    if (squares[2] &&
      squares[2] === squares[4] &&
      squares[2] === squares[6] &&
      squares[4] === squares[6]) {
      winnerIndexes.push(2);
      winnerIndexes.push(4);
      winnerIndexes.push(6);
    }

    if (winnerIndexes.length > 0) {
      const currentGameState = this.state.history[this.state.history.length - 1];
      let winStateCopy = currentGameState.winState.slice();
      winnerIndexes.forEach(ind => {
        winStateCopy[ind] = 1;
      });

      return winStateCopy;
    }

    return null;
  }

  // Jumps to a state in the past by slicing the history array and updating the index
  // Doesn't allow for jumps in future
  jumpTo(index) {
    if (this.state.historyIndex === index) return;

    const historySlice = this.state.history.slice(0, index + 1);
    this.setState({ history: historySlice, historyIndex: index });
  }

  // Handler for the clicks on the squares
  handleClick(i) {
    // Copy the squares array
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // Can't overwrite cells already written
    if (current.winner || current.squares[i]) return;

    let nextTurn = current.turn === 'X' ? 'O' : 'X';
    squares[i] = current.turn;

    let nextState = new GameState();
    nextState.squares = squares;

    // Tests if the nextState is a winning one
    let winState = this.isWinning(nextState);
    if (winState) {
      nextState.status = 'WINNER IS ' + current.turn;
      nextState.winState = winState.slice();
      nextState.turn = current.turn;
      nextState.winner = current.turn;
    } else {
      nextState.turn = nextTurn;
      nextState.status = 'Next player: ' + nextTurn;
    }

    // Update the history array with the nextState created
    this.setState({ history: history.concat([nextState]), historyIndex: this.state.historyIndex + 1 });
  }

  render() {
    return (
      <div className="game row">
        <div className="author-info pt-md-3 col-12 col-md-2 order-3 order-md-1 col-xs-2">
          <h2>
            React Tic Tac Toe
          </h2>
          <p>
            Page created in ReactJs for the intention of learning and getting started with this framework.
            As such it is the first project I've apperhended with the help of the tutorial found <a href="https://reactjs.org/tutorial/tutorial.html">here</a> their website.

          </p>
          <footer>Created by <a href="https://github.com/AntonioDrk">Antonio Druker</a></footer>
        </div>
        <div className="game-board col-12 col-md-6 order-1 order-md-2 d-flex justify-content-center">
          <Board
            gState={this.state.history[this.state.historyIndex]}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info pt-md-3 col-12 col-md-2 order-2 order-md-3">
          <div className={!this.state.history[this.state.historyIndex].winner ? "status" : "status bold"}>{this.state.history[this.state.historyIndex].status}</div>
          <div className="history">
            <p className="bold">History: </p>
            <ul>
              {this.state.history.map(
                (gameState, index) => {
                  return (
                    index === this.state.history.length - 1 ? '' :
                      <li key={index}>
                        <button onClick={() => this.jumpTo(index)}>{index !== 0 ? 'Go to move ' + index : 'Jump to start'}</button>
                      </li>);
                })}
            </ul>

          </div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Game />
  </StrictMode>
);
