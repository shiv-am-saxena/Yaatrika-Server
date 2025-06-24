import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { IRequest } from '../../types/express/index.js';
import ApiError from '../../utils/ApiError.js';
import { MapService } from '../../services/mapService/map.service.js';
import { calculateFare, calculateFareForAllVehicles } from '../../services/fareService/fare.service.js';
import Ride from '../../models/ride.model.js';
import { IRide } from '../../types/ride.js';
import { getTimeDistance } from '../../types/maps.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const createRide = asyncHandler(async (req: IRequest, res: Response) => {
	const { vehicleType, origin, destination } = req.body;
	const userId = req.user?.user?._id;

	if (
		[vehicleType, origin, destination].some(
			(field) =>
				typeof field === 'undefined' ||
				(typeof field === 'string' && field.trim() === '')
		)
	) {
		throw new ApiError(400, 'All fields are required');
	}

	const { distance, duration }: getTimeDistance =
		await MapService.getTimeDistance(origin, destination);

	const fare = await calculateFare(
		vehicleType,
		distance.value / 1000,
		duration.value / 60
	);
	if (!fare) {
		throw new ApiError(500, 'Unable to calculate fare');
	}

	const newRide: IRide = await Ride.create({
		user: userId,
		pickup: origin,
		destination,
		vehicleType,
		fare,
		duration: duration.value,
		distance: distance.value
	});

	if (!newRide) {
		throw new ApiError(500, 'Unable to create a ride at the moment');
	}
	res
		.status(200)
		.json(new apiResponse(200, { newRide }, 'Ride booked waiting for captain'));
});

export const fareCalculation = asyncHandler(
	async (req: IRequest, res: Response) => {
		const { origin, destination } = req.body;
		if (
			[origin, destination].some(
				(field) =>
					typeof field === 'undefined' ||
					(typeof field === 'string' && field.trim() === '')
			)
		) {
			throw new ApiError(400, 'All fields are required');
		}

		const { distance, duration }: getTimeDistance =
			await MapService.getTimeDistance(origin, destination);

		const fare = await calculateFareForAllVehicles(
			distance.value / 1000,
			duration.value / 60
		);
		if (!fare) {
			throw new ApiError(500, 'Unable to calculate fare');
		}
		res.status(200).json(new apiResponse(200, {fare}, "Fare of all vehicles"));
	}
);
