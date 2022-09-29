//@ts-node
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 80;
var SocketData:{String: any};

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
  socket.on('join', ([fromId, toId]:[any,any]) => {
    console.log(`[${fromId}] joining [${toId}]`);

    socket.join(toId);
    socket.to(toId).emit('playerJoined', { 'joinedId': fromId });

    if (fromId === toId){
      SocketData[fromId as keyof {String: any}] = {
        'id': fromId,
        'socketInstance': socket
      };
    }

    let randomPiece = randomInt(0, 1);
    SocketData[fromId  as keyof {String: any}].piece = randomPiece === 0 ? 'X' : 'O';
    SocketData[toId  as keyof {String: any}].piece = randomPiece === 1 ? 'O' : 'X';

    SocketData[fromId  as keyof {String: any}].socket
  });

  socket.on('state-change', ([roomId, newState]: [String, String]) => {
    // console.log('State-change event called with : ' + roomId + '\n' + newState);
    socket.to(roomId).emit('stateChange', newState);
  });

  socket.on('disconnect', () => {

  });
});

httpServer.listen(PORT, () => { console.log('Server online on port ' + PORT); });