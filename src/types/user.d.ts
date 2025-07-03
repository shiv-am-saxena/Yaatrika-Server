import { Document } from 'mongoose';

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	countryCode: string;
	phoneNumber: number;
	gender: 'male' | 'female' | 'other';
	isKycDone: boolean;
	isVerified: boolean;
	socketId?: string | null;
	avatar?: {
		url: string | null;
		publicId: string| null;
	};
	generateJWT(): string;
	verifyJWT(token: string): boolean;
}
