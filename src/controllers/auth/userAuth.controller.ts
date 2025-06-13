import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { IUser } from '../../types/user';
import User from '../../models/user.model.js';
import { apiResponse } from '../../utils/apiResponse.js';
import redisClient from '../../services/redisService.js';
import {
	deleteOtp,
	generateOtp,
	saveOtpToRedis,
	verifyOtpFromRedis
} from '../../services/otp.service.js';
import jwt from 'jsonwebtoken';
import {
	sendVerificationOtp,
	verifyOtpCode
} from '../../services/sms.service.js';
import { IRequest } from '../../types/express/index.js';
export const registerUser = asyncHandler(
	async (req: IRequest, res: Response) => {
		const {
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
			gender,
			countryCode,
			isVerified,
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
				isVerified,
			].some((field) => field?.trim() === '' || typeof field === 'undefined')
		) {
			throw new ApiError(400, 'All fields are required');
		}
		console.log(
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
			gender,
			countryCode,
			isVerified)
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

export const loginWithOtp = asyncHandler(
	async (req: Request, res: Response) => {
		const { phoneNumber, otp } = req.body;

		if (!phoneNumber || !otp) {
			throw new ApiError(400, 'Phone number and OTP are required');
		}

		let isVerified: boolean;

		if (process.env.NODE_ENV !== 'production') {
			// OTP verification via Redis (dev/staging)
			isVerified = await verifyOtpFromRedis(phoneNumber, otp);

			if (!isVerified) {
				throw new ApiError(401, 'Invalid or expired OTP');
			}

			// Remove OTP from Redis after successful verification
			await deleteOtp(phoneNumber);
		} else {
			// OTP verification via Twilio (production)
			isVerified = await verifyOtpCode(phoneNumber, otp);

			if (!isVerified) {
				throw new ApiError(401, 'Invalid or expired OTP');
			}
		}

		if (!isVerified) {
			throw new ApiError(401, 'OTP verification failed');
		}

		// Find the user by phone number
		const user = await User.findOne({ phoneNumber });

		if (!user) {
			throw new ApiError(404, 'User not found. Please register first.');
		}

		// Generate JWT token
		const token = user.generateJWT();

		if (!token) {
			throw new ApiError(500, 'Token generation failed');
		}

		// Set auth token as HTTP-only cookie
		res
			.status(200)
			.cookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(new apiResponse(200, {user, token}, 'Login successful'));
	}
);

export const logout = async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(400).json({ message: 'Token missing' });
	// Add token to Redis blacklist with expiry same as token’s TTL
	const decoded = jwt.decode(token) as { exp: number };
	const ttl = decoded.exp - Math.floor(Date.now() / 1000); // in seconds

	await redisClient.setex(`blacklistedToken:${token}`, ttl, 'true');

	res
		.status(200)
		.clearCookie('auth_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			sameSite: 'strict',
			maxAge: 0 // Clear the cookie
		})
		.json(new apiResponse(200, null, 'Successfully Logged Out'));
};

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
	const { phoneNumber } = req.body;

	if (!phoneNumber || typeof phoneNumber !== 'string') {
		throw new ApiError(400, 'Valid phone number is required');
	}

	// Development environment: generate OTP and send via response
	if (process.env.NODE_ENV !== 'production') {
		const otp = generateOtp();
		if (!otp) {
			throw new ApiError(500, 'Failed to generate OTP');
		}

		const result = await saveOtpToRedis(phoneNumber, otp);
		if (!result) {
			throw new ApiError(500, 'Failed to save OTP to Redis');
		}

		res.status(201).json(new apiResponse(201, otp, 'OTP sent successfully'));
		return;
	}

	// Production: use Twilio
	const isOTPSent = await sendVerificationOtp(phoneNumber);

	if (
		!isOTPSent ||
		!Array.isArray(isOTPSent.sendCodeAttempts) ||
		isOTPSent.sendCodeAttempts.length === 0
	) {
		throw new ApiError(500, 'Failed to send OTP via SMS');
	}

	res.status(201).json(new apiResponse(201, null, 'OTP sent successfully'));
});

export const verifyOtp = asyncHandler(async( req:Request, res: Response)=>{
		const { phoneNumber, otp } = req.body;

		if (!phoneNumber || !otp) {
			throw new ApiError(400, 'Phone number and OTP are required');
		}

		let isVerified: boolean;

		if (process.env.NODE_ENV !== 'production') {
			// OTP verification via Redis (dev/staging)
			isVerified = await verifyOtpFromRedis(phoneNumber, otp);

			if (!isVerified) {
				throw new ApiError(401, 'Invalid or expired OTP');
			}

			// Remove OTP from Redis after successful verification
			await deleteOtp(phoneNumber);
		} else {
			// OTP verification via Twilio (production)
			isVerified = await verifyOtpCode(phoneNumber, otp);

			if (!isVerified) {
				throw new ApiError(401, 'Invalid or expired OTP');
			}
		}

		if (!isVerified) {
			throw new ApiError(401, 'OTP verification failed');
		}

		// Find the user by phone number
		const user = await User.findOne({ phoneNumber });

		if (user) {
			throw new ApiError(404, 'User already exist.');
		}

		// Set auth token as HTTP-only cookie
		res
			.status(200)
			.json(new apiResponse(200, true, 'OTP Verified Successfully'));
})