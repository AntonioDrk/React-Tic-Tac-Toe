import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {});

io.on('connection', (socket) => {
	console.log('We got a socket conn');
});

httpServer.listen(80);