import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact extends Document {
	passengerId: mongoose.Types.ObjectId;
	name: string;
	phone: string;
}

const EmergencyContactSchema: Schema = new Schema({
	passengerId: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
	name: { type: String, required: true },
	phone: { type: String, required: true }
});

export default mongoose.model<IEmergencyContact>(
	'EmergencyContact',
	EmergencyContactSchema
);
