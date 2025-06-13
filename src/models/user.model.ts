import { Schema } from 'mongoose';
import mongoose from 'mongoose';
import { IUser } from '../types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		countryCode: { type: String, required: true, maxlength: 5 },
		phoneNumber: { type: Number, required: true, maxlength: 10, minlength:10, unique: true },
		gender: { type: String, enum: ['male', 'female', 'other'], required: true },
		isKycDone: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		socketId: { type: String, default: null }
	},
	{
		timestamps: true
	}
);

// 🔑 Generate JWT token
userSchema.methods.generateJWT = function (): string {
	return jwt.sign(
		{ _id: this._id, email: this.email, role:'user' },
		process.env.JWT_SECRET as string, // Ensure this is set in .env
		{ expiresIn: '7d' }
	);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
