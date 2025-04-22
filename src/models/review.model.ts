import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
	tripId: mongoose.Types.ObjectId;
	reviewerId: mongoose.Types.ObjectId;
	revieweeId: mongoose.Types.ObjectId;
	rating: number;
	comment: string;
}

const ReviewSchema: Schema = new Schema({
	tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
	reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, required: true },
	comment: { type: String }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
