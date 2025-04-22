import mongoose, { Schema, Document } from 'mongoose';

export interface IPassenger extends Document {
	userId: mongoose.Types.ObjectId;
}

const PassengerSchema: Schema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<IPassenger>('Passenger', PassengerSchema);
