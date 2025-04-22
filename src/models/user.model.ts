import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // Should be stored in .env

export interface IUser extends Document {
	name: string;
	email: string;
	phone: string;
	password: string;
	userType: 'passenger' | 'driver';
	rating: number;
	comparePassword(candidatePassword: string): Promise<boolean>;
	generateJWT(): string;
}

const UserSchema: Schema<IUser> = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, required: true },
		password: { type: String, required: true },
		userType: { type: String, enum: ['passenger', 'driver'], required: true },
		rating: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
	if (!this.isModified('password')) return next();
	try {
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as mongoose.CallbackError);
	}
});

// Compare plaintext and hashed passwords
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateJWT = function (): string {
	return jwt.sign(
		{
			id: this._id,
			email: this.email,
			userType: this.userType
		},
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
