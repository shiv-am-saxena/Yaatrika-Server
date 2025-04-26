import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { IUser } from '../models/user.model.js';
import { jwtPayload } from '../types/jwtPayload.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // Should be stored in .env
export interface AuthenticatedRequest extends Request {
	user?: IUser;
}

/**
 * Middleware to check if the user is authenticated.
 * Verifies JWT from cookies or Authorization header and attaches user to request.
 */
export const isLoggedIn = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		// Extract token from cookie or "Bearer" Authorization header
		const token =
			req.cookies?.authToken || req.headers.authorization?.split(' ')[1];

		if (!token) {
			throw new ApiError(401, 'Authentication token is missing');
		}

		// Verify the JWT token and extract payload
		const {_id, email} = jwt.verify(token, JWT_SECRET) as jwtPayload;

		// Validate required fields from token
		if (!_id) {
			throw new ApiError(401, 'Invalid token payload');
		}

		// Fetch user from DB using ID from token
		const user = await User.findById(_id).select('-password'); // omit password for safety

		if (!user) {
			throw new ApiError(401, 'User not found or unauthorized');
		}

		// Attach user to request object for further middleware/routes
		req.user = user;
		next();
	} catch (error) {
		console.error('Auth Middleware Error:', error);
		next(new ApiError(401, 'Unauthorized: Invalid or expired token'));
	}
};
