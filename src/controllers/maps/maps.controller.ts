import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { MapService } from '../../services/mapService/map.service.js';
import ApiError from '../../utils/ApiError.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getCoordinates = asyncHandler(
	async (req: Request, res: Response) => {
		const { address } = req.body;
		if (!address) {
			throw new ApiError(400, 'Please provide address to find coordinates');
		}
		const coordinates = await MapService.getGeolocation(address);
		if (!coordinates) {
			throw new ApiError(500, 'Unable to get coordinates');
		}
		res
			.status(200)
			.json(
				new apiResponse(200, { coordinates }, 'Coordinates fetched successfully')
			);
	}
);

export const getTimeDistance = asyncHandler(
	async (req: Request, res: Response) => {
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
		const time = await MapService.getTimeDistance(origin, destination);
		if (!time) {
			throw new ApiError(500, 'Unable to get time and distance');
		}
		res
			.status(200)
			.json(new apiResponse(200, time, 'Time and Distance Fetched Successfully'));
	}
);

export const getSuggestion = asyncHandler(
	async (req: Request, res: Response) => {
		const input = req.query.input as string;
		if (!input) {
			throw new ApiError(400, 'Query is required to search');
		}

		const suggestions = await MapService.autocompleteInput(input);

		res
			.status(200)
			.json(
				new apiResponse(200, { suggestions }, 'Suggestions based on the input')
			);
	}
);

export const getAddress = asyncHandler(async (req:Request, res: Response)=>{
	const { coords } = req.body;
	if(!coords){
		throw new ApiError(400, 'zplease provide the coordinates');
	}
	const address = await MapService.fetchAddress(coords.latitude, coords.longitude);
	res.status(200).json(new apiResponse(200, {address}, "Address fetched"));
})