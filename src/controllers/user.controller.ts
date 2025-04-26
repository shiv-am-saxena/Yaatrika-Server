import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Otp } from '../models/otp.model.js';
import { generateOTP, hashOTP } from '../utils/otpHelper.js';
import { sendEmailOTP } from '../utils/sendEmail.js';
/**
 * @desc Registers a new user (passenger or driver)
 * @route POST /api/v1/auth/client/register
 * @access Public
 */
export const registerUser = asyncHandler(
	async (req: Request, res: Response) => {
		const { name, email, phone, password } = req.body;

		// Basic validation for required fields
		if ([name, email, phone, password].some((field) => field.trim() === '')) {
			throw new ApiError(400, 'All fields are required');
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new ApiError(409, 'User with this email already exists');
		}

		// Create and save new user (password is hashed automatically in pre-save hook)
		const newUser = await User.create({
			name,
			email,
			phone,
			password,
			userType: 'passenger'
		});

		if (!newUser) {
			throw new ApiError(500, 'Failed to register user');
		}

		// Generate JWT token
		const token = newUser.generateJWT();

		// Respond with auth token and user data
		res
			.status(201)
			.setHeader('Authorization', token)
			.cookie('authToken', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(
				new apiResponse(
					201,
					{ token, user: newUser },
					'User registered successfully'
				)
			);
	}
);
/**
 * @desc Registers a new user (passenger or driver)
 * @route POST /api/v1/auth/driver/register
 * @access Public
 */
export const registerDriver = asyncHandler(
	async (req: Request, res: Response) => {
		const { name, email, phone, password } = req.body;

		// Basic validation for required fields
		if ([name, email, phone, password].some((field) => field.trim() === '')) {
			throw new ApiError(400, 'All fields are required');
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new ApiError(409, 'User with this email already exists');
		}

		// Create and save new user (password is hashed automatically in pre-save hook)
		const newUser = await User.create({
			name,
			email,
			phone,
			password,
			userType: 'driver'
		});

		if (!newUser) {
			throw new ApiError(500, 'Failed to register user');
		}

		// Generate JWT token
		const token = newUser.generateJWT();

		// Respond with auth token and user data
		res
			.status(201)
			.setHeader('Authorization', token)
			.cookie('authToken', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})
			.json(
				new apiResponse(
					201,
					{ token, user: newUser },
					'User registered successfully'
				)
			);
	}
);

/**
 * @desc Logs in an existing user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = req.body;

	// Basic validation
	if (!email || !password) {
		throw new ApiError(400, 'Email and password are required');
	}

	// Find user by email
	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(401, 'Invalid email or password');
	}

	// Compare passwords
	const isPasswordValid = await user.comparePassword(password);
	if (!isPasswordValid) {
		throw new ApiError(401, 'Invalid email or password');
	}

	// Generate JWT token
	const token = user.generateJWT();

	// Respond with token and user
	res
		.status(200)
		.setHeader('Authorization', token)
		.cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		})
		.json(new apiResponse(200, { token, user }, 'Login successful'));
});

/**
 * @desc Logs out the user
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
	res
		.status(200)
		.clearCookie('authToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		})
		.json(new apiResponse(200, null, 'Logged out successfully'));
});

/**
 * @desc sends the otp to the user
 * @access Private
 */

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
	const { type, identifier } = req.body; // identifier = phone or email

	if (!type || !['email', 'phone'].includes(type) || !identifier) {
		throw new ApiError(400, 'Invalid OTP request');
	}

	const user = await User.findOne(
		type === 'email' ? { email: identifier } : { phone: identifier }
	);
	if (!user) throw new ApiError(404, 'User not found');

	const rawOtp = generateOTP();
	const hashed = hashOTP(rawOtp);
	const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

	await Otp.findOneAndUpdate(
		{ userId: user._id, type },
		{ otp: hashed, expiresAt: expiry, createdAt: new Date() },
		{ upsert: true }
	);

	if (type === 'email') {
		await sendEmailOTP(identifier, rawOtp);
	}

	res.status(200).json(new apiResponse(200, {}, `OTP sent to your ${type}`));
});

/**
 * @desc Verifies the user otp
 * @access Private
 */

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
	const { type, identifier, otp } = req.body;

	if (!type || !identifier || !otp)
		throw new ApiError(400, 'Missing OTP details');

	const user = await User.findOne(
		type === 'email' ? { email: identifier } : { phone: identifier }
	);
	if (!user) throw new ApiError(404, 'User not found');

	const record = await Otp.findOne({ userId: user._id, type });
	if (!record || record.expiresAt < new Date()) {
		throw new ApiError(400, 'OTP expired or invalid');
	}

	const isMatch = hashOTP(otp) === record.otp;
	if (!isMatch) throw new ApiError(401, 'Incorrect OTP');

	// You could set verifiedEmail / verifiedPhone in User model here

	await record.deleteOne();

	res
		.status(200)
		.json(new apiResponse(200, {}, `${type} verified successfully`));
});
