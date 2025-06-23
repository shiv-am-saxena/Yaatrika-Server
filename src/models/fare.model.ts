// models/FareRate.ts
import mongoose, { Schema } from 'mongoose';
import { IFareRate } from '../types/fare';

const fareRateSchema = new Schema<IFareRate>(
	{
		vehicleType: {
			type: String,
			enum: ['bike', 'auto', 'sedan', 'suv'],
			required: true,
			unique: true
		},
		baseFare: { type: Number, required: true },
		perKmRate: { type: Number, required: true },
		perMinRate: { type: Number, required: true },
		minFare: { type: Number, required: true },
		surgeMultiplier: { type: Number, default: 1 },
		updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

const FareRate = mongoose.model<IFareRate>('FareRate', fareRateSchema);
export default FareRate;