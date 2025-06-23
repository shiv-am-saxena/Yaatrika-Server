import { Document, ObjectId } from 'mongoose';

export interface IRide extends Document {
	user: ObjectId;
	captain: ObjectId;
	pickup: string;
	destination: string;
	fare: number;
	status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
	vehicleType: 'sedan' | 'bike' | 'auto' | 'suv';
	duration: number;
	distance: number;
	paymentId: ObjectId;
	orderId: string;
	signature: string;
    otp: number;
}
