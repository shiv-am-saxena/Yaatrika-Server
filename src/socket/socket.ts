import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtPayload } from '../types/jwtPayload.js';
import redisClient from '../services/redisService.js';
import User from '../models/user.model.js';
import Captain from '../models/captain.model.js';

type SocketUserRole = 'user' | 'captain';

interface SocketAuthData {
	userId: string;
	role: SocketUserRole;
}

let io: Server | null = null;

const normalizeToken = (rawToken: string): string =>
	rawToken.replace(/^Bearer\s+/i, '').trim();

const extractTokenFromSocket = (socket: Socket): string | null => {
	const authToken = socket.handshake.auth?.token;
	if (typeof authToken === 'string' && authToken.trim() !== '') {
		return normalizeToken(authToken);
	}

	const authorizationHeader = socket.handshake.headers.authorization;
	if (
		typeof authorizationHeader === 'string' &&
		authorizationHeader.trim() !== ''
	) {
		return normalizeToken(authorizationHeader);
	}

	return null;
};

const updateSocketId = async (
	userId: string,
	role: SocketUserRole,
	socketId: string | null
): Promise<void> => {
	if (role === 'captain') {
		await Captain.findByIdAndUpdate(userId, { socketId });
		return;
	}

	await User.findByIdAndUpdate(userId, { socketId });
};

export const initializeSocketServer = (httpServer: HttpServer): Server => {
	io = new Server(httpServer, {
		cors: {
			origin: process.env.CORS_ORIGIN,
			credentials: true
		}
	});

	io.use(async (socket, next) => {
		try {
			const token = extractTokenFromSocket(socket);
			if (!token) {
				return next(new Error('Unauthorized: Missing token'));
			}

			const isBlacklisted = await redisClient.get(`blacklistedToken:${token}`);
			if (isBlacklisted) {
				return next(new Error('Unauthorized: Token blacklisted'));
			}

			const payload = jwt.verify(
				token,
				process.env.JWT_SECRET as string
			) as jwtPayload;

			const role: SocketUserRole = payload.role === 'captain' ? 'captain' : 'user';
			const account =
				role === 'captain'
					? await Captain.findById(payload._id).select('_id')
					: await User.findById(payload._id).select('_id');

			if (!account?._id) {
				return next(new Error('Unauthorized: Account not found'));
			}

			(socket.data as SocketAuthData).userId = account._id.toString();
			(socket.data as SocketAuthData).role = role;
			next();
		} catch (error) {
			next(new Error('Unauthorized: Invalid token'));
		}
	});

	io.on('connection', async (socket) => {
		const { userId, role } = socket.data as SocketAuthData;

		try {
			socket.join(`${role}:${userId}`);
			socket.join(`role:${role}`);
			await updateSocketId(userId, role, socket.id);
			socket.emit('socket:connected', { socketId: socket.id, role });
		} catch (error) {
			console.error('Socket connect setup failed:', error);
		}

		socket.on('disconnect', async () => {
			try {
				if (role === 'captain') {
					await Captain.findOneAndUpdate(
						{ _id: userId, socketId: socket.id },
						{ socketId: null }
					);
					return;
				}

				await User.findOneAndUpdate(
					{ _id: userId, socketId: socket.id },
					{ socketId: null }
				);
			} catch (error) {
				console.error('Socket disconnect cleanup failed:', error);
			}
		});
	});

	return io;
};

export const getSocketServer = (): Server | null => io;

export const emitToRole = (
	role: SocketUserRole,
	eventName: string,
	payload: unknown
): void => {
	if (!io) {
		return;
	}

	io.to(`role:${role}`).emit(eventName, payload);
};

export const emitToAccount = (
	role: SocketUserRole,
	accountId: string,
	eventName: string,
	payload: unknown
): void => {
	if (!io) {
		return;
	}

	io.to(`${role}:${accountId}`).emit(eventName, payload);
};
