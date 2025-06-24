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


export const calculateFareForAllVehicles = async (distance: number, duration: number) => {
	const rates = await FareRate.find({});
	if (!rates || rates.length === 0) throw new ApiError(500, 'No fare rates found');

	const fares: Record<string, number> = {};

	for (const rate of rates) {
		const rawFare = rate.baseFare + distance * rate.perKmRate + duration * rate.perMinRate;
		const surgedFare = rawFare * (rate.surgeMultiplier || 1);
		fares[rate.vehicleType] = Math.max(rate.minFare, parseFloat(surgedFare.toFixed(2)));
	}

	return fares;
};