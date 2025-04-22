import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
	tripId: mongoose.Types.ObjectId;
	passengerId: mongoose.Types.ObjectId;
	paymentMethod: string;
	amount: number;
	paymentStatus: string;
}

const PaymentSchema: Schema = new Schema({
	tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
	passengerId: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
	paymentMethod: { type: String, required: true },
	amount: { type: Number, required: true },
	paymentStatus: { type: String, required: true }
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
