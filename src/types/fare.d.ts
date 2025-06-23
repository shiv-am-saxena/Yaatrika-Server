import { Document, ObjectId } from "mongoose";

export interface IFareRate extends Document {
	vehicleType: 'bike' | 'auto' | 'sedan' | 'suv';
	baseFare: number;
	perKmRate: number;
	perMinRate: number;
	minFare: number;
	surgeMultiplier: number;
	updatedBy: ObjectId;
}
