import { Types } from 'mongoose';
import { IUser } from '../user';
import { ICaptain } from '../captain';

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
