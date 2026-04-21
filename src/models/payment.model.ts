import mongoose, { Schema, model } from 'mongoose';
import { IPayment } from '../types/payment';

const paymentSchema = new Schema<IPayment>(
	{
		ride: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ride',
			required: true
		},

		method: {
			type: String,
			enum: ['razorpay', 'cash'],
			required: true
		},

		status: {
			type: String,
			enum: ['pending', 'paid', 'failed', 'refunded'],
			default: 'pending'
		},

		amount: {
			type: Number,
			required: true
		},

		currency: {
			type: String,
			default: 'INR'
		},

		// Razorpay specific fields
		razorpay_payment_id: String,
		razorpay_order_id: String,
		razorpay_signature: String,

		captured: Boolean,
		email: String,
		contact: String,
		description: String
	},
	{
		timestamps: true
	}
);

const Payment = model<IPayment>('Payment', paymentSchema);
export default Payment;
