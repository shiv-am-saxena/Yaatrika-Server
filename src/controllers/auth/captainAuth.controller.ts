import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import Captain from '../../models/captain.model.js';
import { Request, Response } from 'express';
import { ICaptain } from '../../types/captain';

// ============================
// ✅ Captain Registration
// ============================
export const registerCaptain = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			firstName,
			lastName,
			email,
			phoneNumber,
			gender,
			countryCode,
			isVerified
		} = req.body;

		// ✅ Check for required fields
		if (
			[
				firstName,
				lastName,
				email,
				phoneNumber,
				gender,
				countryCode,
				isVerified
			].some(
				(field) => typeof field === 'undefined' || String(field).trim() === ''
			)
		) {
			throw new ApiError(400, 'All fields are required');
		}

		// ✅ Prevent duplicate email
		const existingCaptain = await Captain.findOne({ phoneNumber });
		if (existingCaptain) {
			throw new ApiError(400, 'Account already exists');
		}

		// ✅ Create captain
		const user: ICaptain = await Captain.create({
			firstName,
			lastName,
			email,
			countryCode,
			gender,
			phoneNumber,
			isVerified,
			isKycDone: false
		});

		if (!user) {
			throw new ApiError(500, 'Captain registration failed');
		}

		const token = user.generateJWT();
		if (!token) {
			throw new ApiError(500, 'Token generation failed');
		}

		// ✅ Send token cookie & response
		res
			.status(201)
			.cookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(
				new apiResponse(
					201,
					{ user, token },
					'Captain registered successfully'
				)
			);
	}
);
