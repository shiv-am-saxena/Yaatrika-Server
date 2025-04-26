import dotenv from 'dotenv';
import connectDb from './db/mongooseConnection.js';
import { app } from './app.js';
import errorHandler from './middlewares/errorHandler.js';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('trackLocation', (data) => {
        const { passengerId, location } = data;
        // Broadcast location to emergency contact
        socket.broadcast.emit(`location:${passengerId}`, location);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

connectDb()
	.then(() => {
		server.listen(port, () => {
			console.log(`Server is running at port ${port}`);
		});
	})
	.catch((err) => {
		console.log(`Connection to the database failed due to ${err}`);
	});

app.use(errorHandler);

export { server, io };