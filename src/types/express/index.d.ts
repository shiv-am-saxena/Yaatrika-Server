import { Types } from 'mongoose';
import { IUser } from '../user.js';
import { ICaptain } from '../captain.js';

declare global {
	namespace Express {
		interface Request {
			user?: {
				user?: IUser | ICaptain;
				role?: string;
			};
		}
	}
}
