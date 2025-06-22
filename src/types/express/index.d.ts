import {ICaptain} from '../captain';
import { IUser } from '../user'; // adjust import path
import { Request } from 'express';

export interface IRequest extends Request {
	user?: {
		user?: IUser | ICaptain;
		role?: string;
	};
}
