import { IUser } from '../user';

declare global {
	namespace Express {
		interface Request {
			user?: string | IUser; // You can make this more specific if needed
		}
	}
}
