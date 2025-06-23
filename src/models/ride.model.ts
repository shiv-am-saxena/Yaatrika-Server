import mongoose, { Schema, model } from 'mongoose';
import { IRide } from '../types/ride';

const rideSchema = new Schema<IRide>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		captain: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Captain',
		},
		pickup: {
			type: String,
			required: true,
			trim: true
		},
		destination: {
			type: String,
			required: true,
			trim: true
		},
		fare: {
			type: Number,
			required: true,
			min: 0
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
			default: 'pending'
		},
		duration: {
			type: Number, // in seconds
			required: true,
			min: 0
		},
		distance: {
			type: Number, // in meters
			required: true,
			min: 0
		},
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Payment',
		},
		orderId: {
			type: String,
			trim: true
		},
		signature: {
			type: String,
			required: true,
			trim: true
		}
	},
	{
		timestamps: true
	}
);

const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
