import { Document } from 'mongoose';

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	countryCode: string;
	phoneNumber: number;
	gender: 'male' | 'female' | 'other';
	password: string;
	isKycDone: boolean;
	isVerified: boolean;
	socketId?: string | null;

	comparePassword(candidatePassword: string): Promise<boolean>;
	generateJWT(): string;
	verifyJWT(token: string): boolean;
}
