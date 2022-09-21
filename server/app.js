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
	socket.on('test-event', (id) => {
		console.log('Received test event from ' + id + ' !');
	});
});

httpServer.listen(PORT, () => { console.log('Server online on port ' + PORT); });