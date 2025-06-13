import { Schema } from 'mongoose';
import mongoose from 'mongoose';
import { IUser } from '../types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const userSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		countryCode: { type: String, required: true, maxlength: 5 },
		phoneNumber: { type: Number, required: true, maxlength: 10, minlength:10, unique: true },
		gender: { type: String, enum: ['male', 'female', 'other'], required: true },
		password: { type: String, required: true, select: false },
		isKycDone: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		socketId: { type: String, default: null }
	},
	{
		timestamps: true
	}
);

// 🔐 Pre-save hook for hashing password
userSchema.pre('save', async function (next) {
	const user = this as mongoose.Document & IUser;

	if (!user.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		return next();
	} catch (err) {
		return next(err as Error);
	}
});

// 🔍 Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// 🔑 Generate JWT token
userSchema.methods.generateJWT = function (): string {
	return jwt.sign(
		{ _id: this._id, email: this.email },
		process.env.JWT_SECRET as string, // Ensure this is set in .env
		{ expiresIn: '7d' }
	);
};

userSchema.methods.verifyJWT = function (token: string): boolean {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
		return !!decoded;
	} catch (error) {
		console.error('JWT verification failed:', error);
		return false;
	}
};
const User = mongoose.model<IUser>('User', userSchema);

export default User;
