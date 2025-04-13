import { Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { model } from 'mongoose';


export interface IUser extends Document {
	fullName: { firstName: string; lastName?: string };
	email: string;
	password: string;
	socketId?: string;
	isValidPassword(password: string): Promise<boolean>;
	genJWT(): string;
}

// Define an interface for the User model
export interface IUserModel extends Model<IUser> {
	hashPassword(password: string): Promise<string>;
}
const userSchema: Schema<IUser> = new Schema({
	fullName: {
		firstName: {
			type: String,
			required: true,
			minLength: [3, 'First name should be at least 3 characters long.']
		},
		lastName: {
			type: String,
			minLength: [3, 'Last name should be at least 3 characters long.']
		}
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	socketId: {
		type: String
	}
});

userSchema.statics.hashPassword = async function (
	password: string
): Promise<string> {
	return await bcrypt.hash(password, 10);
};

// Instance method
userSchema.methods.isValidPassword = async function (
	password: string
): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

// Generate JWT Token
userSchema.methods.genJWT = function (): string {
	return jwt.sign(
		{ id: this._id, email: this.email },
		process.env.JWT_SECRET as string,
		{ expiresIn: '24h' }
	);
};

// Export the User model
export const User = model<IUser, IUserModel>('User', userSchema);