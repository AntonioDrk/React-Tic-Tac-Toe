import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 80;

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:3000'
	}
});

io.on('connection', (socket) => {
	console.log('We got a socket conn');
	// Bind the global events
	socket.on('join', ([fromId, toId]) => {
		console.log(`[${fromId}] joining [${toId}]`);
		socket.join(toId);
	});
});

httpServer.listen(PORT, () => { console.log('Server online on port ' + PORT); });