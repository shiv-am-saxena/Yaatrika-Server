import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { IUser } from '../../types/user';
import User from '../../models/user.model.js';
import { apiResponse } from '../../utils/apiResponse.js';
import redisClient from '../../services/redis.service.js';

export const registerUser = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
			gender,
			countryCode,
			isVerified
		} = req.body;
		if (
			[
				firstName,
				lastName,
				phoneNumber,
				gender,
				email,
				countryCode,
				password,
				isVerified
			].some((field) => field?.trim() === '' || typeof field === 'undefined')
		) {
			throw new ApiError(400, 'All fields are required');
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new ApiError(400, 'User Already Exists');
		}
		const user: IUser = await User.create({
			firstName,
			lastName,
			email,
			countryCode,
			gender,
			password,
			phoneNumber,
			isVerified,
			isKycDone: false
		});
		if (!user) {
			throw new ApiError(500, 'User Registration Failed');
		}
		const token = user.generateJWT();
		if (!token) {
			throw new ApiError(500, 'Token Generation Failed');
		}
		res
			.status(201)
			.cookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(new apiResponse(201, user, 'User Registered Successfully'));
	}
);

// ✅ Login handler using phone and OTP
export const loginWithPhoneOtp = asyncHandler(
	async (req: Request, res: Response) => {
		const { phoneNumber, otp } = req.body;
		if (
			[phoneNumber, otp].some(
				(field) => field?.trim() === '' || typeof field === 'undefined'
			)
		) {
			throw new ApiError(400, 'All fields are required');
		}

		// Step 1: Validate OTP from Redis
		const storedOtp = await redisClient.get(phoneNumber);
		if (!storedOtp || storedOtp !== otp) {
			throw new ApiError(401, 'Invalid or expired OTP');
		}

		// Step 2: Find user
		let user = await User.findOne({ phoneNumber });

		if (!user) {
			throw new ApiError(404, 'User not found. Please register first.');
		}

		// Step 3: Sign JWT token
		const token = user.generateJWT();
		if (!token) {
			throw new ApiError(500, 'Token Generation Failed');
		}

		// Step 4: Clean OTP from Redis (security best practice)
		await redisClient.del(phoneNumber);

		res
			.status(200)
			.json(new apiResponse(200, { token, user }, 'Logged in successfully'));
	}
);
