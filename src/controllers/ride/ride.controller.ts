import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { MapService } from '../../services/mapService/map.service.js';
import {
	calculateFare,
	calculateFareForAllVehicles
} from '../../services/fareService/fare.service.js';
import Ride from '../../models/ride.model.js';
import { IRide } from '../../types/ride.js';
import { getTimeDistance } from '../../types/maps.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { emitToAccount, emitToRole } from '../../socket/socket.js';

const generateRideOtp = (): number =>
	Math.floor(100000 + Math.random() * 900000);

const sanitizeRidePayload = (ride: any) => {
	const ridePayload = ride?.toObject ? ride.toObject() : ride;
	if (ridePayload && typeof ridePayload === 'object') {
		delete ridePayload.otp;
	}
	return ridePayload;
};

const resolveEntityId = (entity: any): string => {
	if (entity && typeof entity === 'object' && entity._id) {
		return String(entity._id);
	}

	return String(entity);
};

export const createRide = asyncHandler(
	async (req: Request, res: Response, next) => {
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

		if (!userId) {
			throw new ApiError(401, 'Unauthorized');
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
			distance: distance.value,
			otp: generateRideOtp()
		});

		if (!newRide) {
			throw new ApiError(500, 'Unable to create a ride at the moment');
		}

		const ridePayload = sanitizeRidePayload(newRide);

		emitToRole('captain', 'ride:new-request', {
			ride: ridePayload,
			riderId: userId
		});

		res
			.status(200)
			.json(
				new apiResponse(
					200,
					{ newRide: ridePayload },
					'Ride booked waiting for captain'
				)
			);
	}
);

export const acceptRide = asyncHandler(
	async (req: Request, res: Response, next) => {
		const role = req.user?.role;
		const captainId = req.user?.user?._id;
		const { rideId } = req.body;

		if (role !== 'captain') {
			throw new ApiError(403, 'Only captain can accept rides');
		}

		if (!captainId) {
			throw new ApiError(401, 'Unauthorized');
		}

		if (!rideId || typeof rideId !== 'string') {
			throw new ApiError(400, 'rideId is required');
		}

		const acceptedRide = await Ride.findOneAndUpdate(
			{
				_id: rideId,
				status: 'pending',
				$or: [{ captain: { $exists: false } }, { captain: null }]
			},
			{
				captain: captainId,
				status: 'accepted'
			},
			{ new: true }
		)
			.populate('user', 'firstName lastName phoneNumber')
			.populate(
				'captain',
				'firstName lastName phoneNumber vehicalType vehicalPlate'
			);

		if (!acceptedRide) {
			throw new ApiError(409, 'Ride is no longer available');
		}

		const rideWithOtp = await Ride.findById(acceptedRide._id).select('+otp');
		if (!rideWithOtp?.otp) {
			throw new ApiError(500, 'Ride OTP is missing');
		}

		const ridePayload = sanitizeRidePayload(acceptedRide);
		const riderId = resolveEntityId(acceptedRide.user);
		const captainAccountId = resolveEntityId(acceptedRide.captain);

		emitToAccount('captain', captainAccountId, 'ride:accepted', {
			ride: ridePayload
		});

		emitToAccount('user', riderId, 'ride:accepted', {
			ride: ridePayload,
			otp: String(rideWithOtp.otp)
		});

		res
			.status(200)
			.json(new apiResponse(200, { ride: ridePayload }, 'Ride accepted'));
	}
);

export const startRideWithOtp = asyncHandler(
	async (req: Request, res: Response, next) => {
		const role = req.user?.role;
		const captainId = req.user?.user?._id;
		const { rideId, otp } = req.body;

		if (role !== 'captain') {
			throw new ApiError(403, 'Only captain can start rides');
		}

		if (!captainId) {
			throw new ApiError(401, 'Unauthorized');
		}

		if (!rideId || typeof rideId !== 'string' || !otp) {
			throw new ApiError(400, 'rideId and otp are required');
		}

		const ride = await Ride.findOne({
			_id: rideId,
			captain: captainId,
			status: 'accepted'
		})
			.select('+otp')
			.populate('user', 'firstName lastName phoneNumber')
			.populate(
				'captain',
				'firstName lastName phoneNumber vehicalType vehicalPlate'
			);

		if (!ride) {
			throw new ApiError(404, 'Accepted ride not found');
		}

		if (String(ride.otp) !== String(otp)) {
			throw new ApiError(400, 'Invalid ride OTP');
		}

		ride.status = 'ongoing';
		await ride.save();

		const ridePayload = sanitizeRidePayload(ride);
		const riderId = resolveEntityId(ride.user);
		const captainAccountId = resolveEntityId(ride.captain);

		emitToAccount('user', riderId, 'ride:started', {
			ride: ridePayload
		});

		emitToAccount('captain', captainAccountId, 'ride:started', {
			ride: ridePayload
		});

		res
			.status(200)
			.json(
				new apiResponse(200, { ride: ridePayload }, 'Ride started successfully')
			);
	}
);

export const getCurrentRide = asyncHandler(
	async (req: Request, res: Response, next) => {
		const role = req.user?.role;
		const accountId = req.user?.user?._id;

		if (!accountId || !role) {
			throw new ApiError(401, 'Unauthorized');
		}

		const query =
			role === 'captain'
				? {
						captain: accountId,
						status: { $in: ['accepted', 'ongoing'] }
					}
				: {
						user: accountId,
						status: { $in: ['pending', 'accepted', 'ongoing'] }
					};

		const ride = await Ride.findOne(query)
			.sort({ updatedAt: -1 })
			.populate('user', 'firstName lastName phoneNumber')
			.populate(
				'captain',
				'firstName lastName phoneNumber vehicalType vehicalPlate'
			);

		if (!ride) {
			res
				.status(200)
				.json(new apiResponse(200, { ride: null }, 'No active ride found'));
			return;
		}

		let otp: string | null = null;
		if (role === 'user' && ride.status === 'accepted') {
			const rideWithOtp = await Ride.findById(ride._id).select('+otp');
			otp = rideWithOtp?.otp ? String(rideWithOtp.otp) : null;
		}

		const ridePayload = sanitizeRidePayload(ride);

		res
			.status(200)
			.json(
				new apiResponse(200, { ride: ridePayload, otp }, 'Active ride fetched')
			);
	}
);

export const fareCalculation = asyncHandler(
	async (req: Request, res: Response, next) => {
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
		res.status(200).json(new apiResponse(200, { fare }, 'Fare of all vehicles'));
	}
);
