import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
	driverId: mongoose.Types.ObjectId;
	passengerId: mongoose.Types.ObjectId;
	startLocation: string;
	endLocation: string;
	tripDateTime: Date;
	status: 'ongoing' | 'completed' | 'cancelled';
	fare: number;
}

const TripSchema: Schema = new Schema({
	driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
	passengerId: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
	startLocation: { type: String, required: true },
	endLocation: { type: String, required: true },
	tripDateTime: { type: Date, required: true },
	status: {
		type: String,
		enum: ['ongoing', 'completed', 'cancelled'],
		default: 'ongoing'
	},
	fare: { type: Number, required: true }
});

export default mongoose.model<ITrip>('Trip', TripSchema);
