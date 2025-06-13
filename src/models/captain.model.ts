import mongoose, { Schema } from 'mongoose';
import { ICaptain } from '../types/captain';
import jwt from 'jsonwebtoken';
const captainSchema = new Schema<ICaptain>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		countryCode: { type: String, required: true, maxlength: 5 },
		phoneNumber: {
			type: Number,
			required: true,
			maxlength: 10,
			minlength: 10,
			unique: true
		},
		gender: { type: String, enum: ['male', 'female', 'other'], required: true },
		isKycDone: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		socketId: { type: String, default: null },
		vehicalColor: { type: String, default: 'pink' },
		vehicalCapacity: { type: Number, default: null },
		vehicalType: { type: String, enum: ['car', 'auto', 'bike'], default: 'car' },
		vehicalPlate: { type: String, default: null },
		status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
		location: {
			latitude: { type: String, default: null },
			longitude: { type: String, default: null }
		}
	},
	{
		timestamps: true
	}
);

// 🔑 Generate JWT token
captainSchema.methods.generateJWT = function (): string {
	return jwt.sign(
		{ _id: this._id, email: this.email, role: 'captain' },
		process.env.JWT_SECRET as string, // Ensure this is set in .env
		{ expiresIn: '7d' }
	);
};
const Captain = mongoose.model<ICaptain>('Captain', captainSchema);

export default Captain;
