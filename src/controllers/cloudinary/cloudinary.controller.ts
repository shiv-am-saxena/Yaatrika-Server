import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
	uploadToCloudinary,
	deleteFromCloudinary,
	fetchAssetDetails
} from '../../services/cloudinary/cloudinaryServices.js';
import ApiError from '../../utils/ApiError.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const uploadAsset = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.file) throw new ApiError(401, 'No file provided');

		const folder = req.body.folder || 'yaatrika/assets';
		const result = await uploadToCloudinary(req.file.buffer, folder);
		res.status(201).json(new apiResponse(201, { result }, 'File Uploaded'));
	}
);

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
	const { publicId } = req.body;
	if (!publicId) throw new ApiError(400, 'Public Id is required');

	const result = await deleteFromCloudinary(publicId);
	res.status(200).json(new apiResponse(200, { result }, 'File Deleted'));
});

export const getAsset = asyncHandler(async (req: Request, res: Response) => {
	const { publicId } = req.params;
	const asset = await fetchAssetDetails(publicId);
	res.status(200).json(new apiResponse(200, { asset }, 'Fetched Successfully'));
});
