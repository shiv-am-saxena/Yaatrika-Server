import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
	passengerId: mongoose.Types.ObjectId;
	methodType: string;
	details: string;
}

const PaymentMethodSchema: Schema = new Schema({
	passengerId: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
	methodType: { type: String, required: true },
	details: { type: String, required: true }
});

export default mongoose.model<IPaymentMethod>(
	'PaymentMethod',
	PaymentMethodSchema
);
