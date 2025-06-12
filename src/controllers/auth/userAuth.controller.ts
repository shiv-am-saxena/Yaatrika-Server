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
import { sendVerificationOtp, verifyOtpCode } from '../../services/sms.service.js';
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

export const loginWithOtp = asyncHandler(
	async (req: Request, res: Response) => {
		const { phoneNumber, otp } = req.body;

		if (!phoneNumber || !otp) {
			throw new ApiError(400, 'Phone number and OTP are required');
		}
		let isVerified:boolean =;
// in this case if the env is development the otp will be verified from the redisDatabase
		if (process.env.NODE_ENV !== 'production') {
			// 1. Verify OTP against Redis
			const isOtpValid = await verifyOtpFromRedis(phoneNumber, otp);

			if (!isOtpValid) {
				throw new ApiError(401, 'Invalid or expired OTP');
			}

			// 2. Delete OTPd after successful verification
			await deleteOtp(phoneNumber);
			isVerified = isOtpValid;
		}
		else if(process.env.NODE_ENV === 'production'){
			const isOtpValid = await verifyOtpCode(phoneNumber, otp);
			if(!isOtpValid){
				throw new ApiError(401, 'Invalid or Expired OTP');
			}
			isVerified = isOtpValid;
		}
		if(!isVerified){
			throw new ApiError(401, "Unauthorized User");
		}
		// 3. Check if user exists
		let user = await User.findOne({ phoneNumber });

		// 4. Auto-register user if not found (optional)
		if (!user) {
			throw new ApiError(404, 'User not found. Please register first.');
		}

		// 5. Generate JWT
		const token = user.generateJWT();
		if (!token) {
			throw new ApiError(500, 'Token Generation Failed');
		}
		res
			.status(200)
			.cookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(new apiResponse(200, user, 'Login Successful'));
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
		.json({ message: 'Successfully logged out' });
};

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
	const { phoneNumber } = req.body;
	if (!phoneNumber) {
		throw new ApiError(400, 'Phone number is required');
	}
	// Generate OTP and send it via SMS (implementation not shown)
	const otp = generateOtp();
	if (!otp) {
		throw new ApiError(500, 'Failed to generate OTP');
	}
	//IF the Node env is development it will sent otp via crypto module as a response which will be displayed on the client side as a alert.
	if (process.env.NODE_ENV !== 'production') {
		await saveOtpToRedis(phoneNumber, otp);
		res.status(201).json(new apiResponse(200, otp, 'OTP Sent successfully.'));
		return;
	}

	//if the node env is production it will use twilio to sent the otp and using this the user will get otp @ provided phone number
	const isOTPSent = await sendVerificationOtp(phoneNumber);
	if (isOTPSent.sendCodeAttempts.length === 0) {
		throw new ApiError(500, 'Failed to send OTP');
	}
	res.status(201).json(new apiResponse(201, null, 'OTP SENT SUCCESSFULLY'));
});
