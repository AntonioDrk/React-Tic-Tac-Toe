import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import statusOnImg from './assets/images/statusOn.svg';
import statusOffImg from './assets/images/statusOff.svg';

const socket = io(process.env.NODE_ENV === 'development' ? 'localhost:3001' : 'tic-tac-toe-backend.up.railway.app');  // Connection to the IO server
const myId = uuidv4();              // Generating my own ID

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
      winState={this.props.gState.winState[i] ? 'winSquare' : ' '}
      value={this.props.gState.squares[i]}
      onClick={() => this.props.onClick(i)}
    />
    );
  }

  render() {
    return (
      <div className='container-fluid pt-3 mb-5'>
        <div className='board-row row g-0 align-items-center'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row row g-0 align-items-center'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row row g-0 align-items-center'>
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

  componentDidUpdate(prevProps) {
    if (prevProps.newState !== this.props.newState) {
      const history = this.state.history;
      this.setState({ history: history.concat([this.props.newState]), historyIndex: this.state.historyIndex + 1 });
    } else if (prevProps.newHistoryIndex !== this.props.newHistoryIndex) {
      this.jumpTo(this.props.newHistoryIndex);
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
    this.props.onNewHistoryIndex(index); // Send the new history index to the other player
  }

  // Handler for the clicks on the squares
  handleClick(i) {


    // Copy the squares array
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.props.piece !== current.turn) return;

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
    this.props.onNewState(nextState);
  }

  render() {
    return (
      <div className='game row'>
        <div className='col-md-1'></div>
        <div className='author-info pt-md-3 col-12 col-md-2 order-3 order-md-1 col-xs-2'>
          <h2>
            React Tic Tac Toe
          </h2>
          <p>
            Page created in ReactJs for the intention of learning and getting started with this framework.
            As such it is the first project I've apperhended with the help of the tutorial found <a href='https://reactjs.org/tutorial/tutorial.html'>here</a> their website.

          </p>
          <footer>Created by <a href='https://github.com/AntonioDrk'>Antonio Druker</a></footer>
        </div>
        <div className='game-board col-12 col-md-6 order-1 order-md-2 d-flex justify-content-center'>
          <Board
            gState={this.state.history[this.state.historyIndex]}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className='game-info pt-md-3 col-12 col-md-2 order-2 order-md-3'>
          <div className={!this.state.history[this.state.historyIndex].winner ? 'status' : 'status bold'}>{this.state.history[this.state.historyIndex].status}</div>
          <div className='history'>
            <p className='bold'>History: </p>
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

class MultiplayerGame extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isConnected: false,
      inputedRoomId: myId,
      nextGState: new GameState(),
      nextHistoryIndex: -1,
      joinedRoomId: '',
      piece: '',
      connectedToRoom: false
    };
  }

  onNewState(newState) {
    socket.emit('state-change', [newState, null]);
  }

  onNewHistoryIndex(newHistoryIndex) {
    socket.emit('state-change', [null, newHistoryIndex]);
  }

  onPlayerJoined({ joinedId }) {
    this.setState({ 'joinedRoomId': joinedId, 'connectedToRoom': true });
  }

  onStateChange([gState, newHistoryIndex]) {

    console.log(`Received new state with \ngameState=${gState}\nnewHistoryIndex=${newHistoryIndex}`);

    if (gState) {
      this.setState({ 'nextGState': gState, 'nextHistoryIndex': -1 });
      return;
    }

    if (newHistoryIndex !== null) {
      this.setState({ 'nextHistoryIndex': newHistoryIndex });
      return;
    }
  }

  onStartGame(piece) {
    this.setState({ 'piece': piece });
  }

  onInputChanged(event) {
    this.setState({ 'inputedRoomId': event.target.value.trim() });
  }

  onJoinButtonClicked() {
    socket.emit('join', [myId, this.state.inputedRoomId]);
  }

  componentDidMount() {

    socket.on('connect', () => {
      this.setState({ 'isConnected': true });
    });

    socket.on('disconnect', () => {
      this.setState({ 'isConnected': false });
    });

    socket.on('playerJoined', (args) => this.onPlayerJoined(args));

    socket.on('stateChange', (args) => this.onStateChange(args));

    socket.on('start-game', (args) => this.onStartGame(args));

    // Join room with your ID
    this.onJoinButtonClicked();
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample08" aria-controls="navbarsExample08" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-md-center" id="navbarsExample08">
              <ul className="navbar-nav">
                <li className="nav-item">
                    <div className="row justify-content-end align-items-center">
                      <div className='col-6'>Server</div>
                      <div className="col-6">
                        <img width='16px' height='16px' src={this.state.isConnected ? statusOnImg : statusOffImg} alt="Status Icon" /> 
                      </div>
                    </div>
                </li>
                <li className="nav-item">
                  <div className="row justify-content-center aling-items-center">
                    <div className="col-8 input-group">
                      <input type='text' aria-describedby='connection-form' className='form-control' placeholder='Partner id:' onChange={(event) => { this.onInputChanged(event); }} />
                      {this.state.isConnected ? (<button className='btn btn-outline-secondary' id='connection-form' type='button'  onClick={() => this.onJoinButtonClicked()}>Join</button>) : ''}
                    </div>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="row justify-content-end">
                    <div className="col-6">
                      <div className='active text-nowrap'> Id: <span className='bold'>{myId}</span> </div>
                    </div>
                  </div>
                </li>
                {/* <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">Dropdown</a>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">Action</a></li>
                    <li><a className="dropdown-item" href="#">Another action</a></li>
                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </li> */}
              </ul>
            </div>
          </div>
        </nav>
        

        {this.state.connectedToRoom ? <p>Connected to {this.state.joinedRoomId} </p> : ''}
        <Game
          piece={this.state.piece}
          onNewState={(newState) => this.onNewState(newState)}
          newState={this.state.nextGState}
          onNewHistoryIndex={(newHistoryIndex) => this.onNewHistoryIndex(newHistoryIndex)}
          newHistoryIndex={this.state.nextHistoryIndex}
        />
      </div>
    )
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <MultiplayerGame />
  </StrictMode>
);
