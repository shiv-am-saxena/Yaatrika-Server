import {ICaptain} from '../captain';
import { IUser } from '../user'; // adjust import path
import { Request } from 'express';

export interface IRequest extends Request {
	user?: IUser | ICaptain;
}
