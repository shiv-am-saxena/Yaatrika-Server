import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import ApiError from '../utils/ApiError.js'; 
import { jwtPayload } from '../types/jwtPayload';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import { IUser } from '../types/user';

export const isLoggedIn = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token =
				req.cookies.authToken || req.headers.authorization?.split(' ')[1];

			//Early exit for missing token
			if (!token) {
				throw new ApiError(401, 'Unauthorized: Missing Token');
			}

			//Check Blacklist First (for performance)
			const isBlacklisted = await redisClient.get(token);
			if (isBlacklisted) {
				throw new ApiError(401, 'Unauthorized: Token Blacklisted');
			}

			// Verify token
			const payload = jwt.verify(
				token,
				`${process.env.ACCESS_TOKEN_SECRET}`
			) as jwtPayload;
			const user: IUser = await User.findById(payload._id).select(
				'-password'
			);

			if (!user) {
				throw new ApiError(401, 'Unauthorized: User not found');
			}
			(req as Request & { user?: IUser }).user = user;
			next();
		} catch (error: any) {
			//Handle Specific Errors for better debugging
			if (error instanceof ApiError) {
				throw error; //Re-throw ApiError for consistent error handling
			} else if (error.name === 'TokenExpiredError') {
				throw new ApiError(401, 'Unauthorized: Token Expired');
			} else if (error.name === 'JsonWebTokenError') {
				throw new ApiError(401, 'Unauthorized: Invalid Token');
			}
			throw new ApiError(500, 'Internal Server Error during authentication'); //Generic Server Error
		}
	}
);
// This middleware checks if the user is logged in by verifying the JWT token.
// It checks for the token in cookies or authorization headers, verifies it,