import { Response, NextFunction } from 'express';
import { IRequest } from '../types/express/index';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redisService.js';
import ApiError from '../utils/ApiError.js';
import { jwtPayload } from '../types/jwtPayload';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Captain from '../models/captain.model.js';
import { IUser } from '../types/user';
import {ICaptain} from '../types/captain';

export const isLoggedIn = asyncHandler(
	async (req: IRequest, res: Response, next: NextFunction) => {
		const token =
			req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];

		if (!token) {
			throw new ApiError(401, 'Unauthorized: Missing token');
		}

		// ✅ Validate against blacklist (stored in Redis)
		const isBlacklisted = await redisClient.get(`blacklistedToken:${token}`);
		if (isBlacklisted) {
			throw new ApiError(401, 'Unauthorized: Token blacklisted');
		}

		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwtPayload;

			let user: IUser | ICaptain | null = null;

			if (payload.role === 'captain') {
				user = await Captain.findById(payload._id);
			} else {
				user = await User.findById(payload._id);
			}

			if (!user) {
				throw new ApiError(401, 'Unauthorized: User not found');
			}

			req.user = user;
			next();
		} catch (error: any) {
			if (error.name === 'TokenExpiredError') {
				throw new ApiError(401, 'Unauthorized: Token expired');
			}

			if (error.name === 'JsonWebTokenError') {
				throw new ApiError(401, 'Unauthorized: Invalid token');
			}

			console.error('Unexpected error in isLoggedIn:', error);
			throw new ApiError(500, 'Internal Server Error during authentication');
		}
	}
);
