import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
	driverId: mongoose.Types.ObjectId;
	plateNumber: string;
	vehicleModel: string;
	color: string;
	vehicleType: string;
}

const VehicleSchema: Schema = new Schema({
	driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
	plateNumber: { type: String, required: true },
	vehicleModel: { type: String, required: true },
	color: { type: String, required: true },
	vehicleType: { type: String, required: true }
});

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
