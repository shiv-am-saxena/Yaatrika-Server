import { Document } from 'mongoose';
export interface ICaptain extends Document {
	firstName: string;
	lastName: string;
	email: string;
	countryCode: string;
	phoneNumber: number;
	gender: 'male' | 'female' | 'other';
	isKycDone: boolean;
	isVerified: boolean;
	socketId?: string | null;
	vehicalColor: string;
	vehicalPlate?: string | null;
	vehicalCapacity?: number | null;
	vehicalType: string;
	status: string;
	location?: Location;
	avatar?: {
		url: string | null;
		publicId: string| null;
	};
	generateJWT(): string;
}

type Location = {
	latitude: string | null;
	longitude: string | null;
};
