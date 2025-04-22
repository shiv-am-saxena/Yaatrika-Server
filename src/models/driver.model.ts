import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
	userId: mongoose.Types.ObjectId;
	licenseNumber: string;
	availabilityStatus: 'available' | 'unavailable';
	experienceYears: number;
	vehicleId: mongoose.Types.ObjectId;
	safetyCertificationNumber: string;
	safetyCertificationExpirationDate: Date;
}

const DriverSchema: Schema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	licenseNumber: { type: String, required: true },
	availabilityStatus: {
		type: String,
		enum: ['available', 'unavailable'],
		default: 'unavailable'
	},
	experienceYears: { type: Number, default: 0 },
	vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
	safetyCertificationNumber: { type: String },
	safetyCertificationExpirationDate: { type: Date }
});

export default mongoose.model<IDriver>('Driver', DriverSchema);
