//@ts-node
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 80;
var SocketData = new Map<String, {'socketInstance':any, 'piece':String}>();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

function randomInt(min:number, max:number):number {
  return Math.floor(Math.random() * max + min);
}

io.on('connection', (socket:any) => {
  console.log('We got a socket conn');
  // Bind the global events
  socket.on('join', ([fromId, toId]:[String,String]) => {
    console.log(`[${fromId}] joining [${toId}]`);

    socket.join(toId);
    socket.to(toId).emit('playerJoined', { 'joinedId': fromId });

    if (fromId === toId){
      SocketData.set(fromId, {'socketInstance': socket, 'piece': undefined});
    }

    let randomPiece = randomInt(0, 1);
    SocketData.set(fromId, {'piece': randomPiece === 0 ? 'X' : 'O', socketInstance: SocketData.get(fromId).socketInstance});
    SocketData.set(toId, {'piece': randomPiece === 1 ? 'X' : 'O', socketInstance: SocketData.get(toId).socketInstance});

    // Send the data to the sockets with what piece they start and that the game is starting
    SocketData.get(fromId).socketInstance.emit('start-game', SocketData.get(fromId).piece);
    SocketData.get(toId).socketInstance.emit('start-game', SocketData.get(toId).piece);
  });

  socket.on('state-change', ([roomId, newState]: [String, String]) => {
    // console.log('State-change event called with : ' + roomId + '\n' + newState);
    socket.to(roomId).emit('stateChange', newState);
  });

  socket.on('disconnect', () => {
    SocketData.keys();
  });
});

httpServer.listen(PORT, () => { console.log('Server online on port ' + PORT); });