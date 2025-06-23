// utils/fareCalculator.ts
import FareRate from "../../models/fare.model.js";
import ApiError from "../../utils/ApiError.js";

export const calculateFare = async (vehicleType:string, distance:number, duration:number) => {
	const rate = await FareRate.findOne({ vehicleType });
	if (!rate) throw new ApiError(500, 'Fare rate not found');

	const rawFare = rate.baseFare + distance * rate.perKmRate + duration * rate.perMinRate;
	const surgedFare = rawFare * (rate.surgeMultiplier || 1);

	return Math.max(rate.minFare, parseFloat(surgedFare.toFixed(2)));
};
