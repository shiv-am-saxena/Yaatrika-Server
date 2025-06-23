import { Document, ObjectId } from 'mongoose';

export interface IPayment extends Document {
	ride: ObjectId; // Reference to the Ride this payment belongs to

	method: PaymentMethod;
	status: PaymentStatus;
	amount: number;
	currency: string;

	// Razorpay-specific (optional for offline)
	razorpay_payment_id?: string;
	razorpay_order_id?: string;
	razorpay_signature?: string;

	captured?: boolean;
	email?: string;
	contact?: string;
	description?: string;

	createdAt: Date;
	updatedAt: Date;
}

export type PaymentMethod = 'razorpay' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
