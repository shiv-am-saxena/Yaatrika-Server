// controllers/adminFareController.ts
import { Response } from 'express';
import FareRate from '../../../models/fare.model.js';
import { IRequest } from '../../../types/express/index.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { apiResponse } from '../../../utils/apiResponse.js';

export const setFareRates = asyncHandler(
	async (req: IRequest, res: Response) => {
		const { rates } = req.body;
		const adminId = req.user?.user?._id;

		for (let vehicleType in rates) {
			const update = { ...rates[vehicleType], updatedBy: adminId };
			await FareRate.findOneAndUpdate({ vehicleType }, update, {
				upsert: true,
				new: true
			});
		}

		res.status(200).json(new apiResponse(200, null, 'Fare rates updated'));
	}
);
