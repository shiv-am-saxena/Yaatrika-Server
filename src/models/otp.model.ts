// models/otp.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
	userId: mongoose.Types.ObjectId;
	otp: string;
	type: 'email' | 'phone';
	createdAt: Date;
	expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	otp: { type: String, required: true },
	type: { type: String, enum: ['email', 'phone'], required: true },
	createdAt: { type: Date, default: Date.now },
	expiresAt: { type: Date, required: true }
});

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
