import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { IUser } from '../../types/user';
import User from '../../models/user.model.js';
import { apiResponse } from '../../utils/apiResponse.js';
import redisClient from '../../services/redisService.js';
import {
	generateOtp,
	saveOtpToRedis
} from '../../services/otpService/otp.service.js';
import jwt from 'jsonwebtoken';
import { sendVerificationOtp } from '../../services/otpService/sms.service.js';
import { IRequest } from '../../types/express/index';
import { otpVerification } from '../../services/otpVerification.service.js';
import { ICaptain } from '../../types/captain';
import Captain from '../../models/captain.model.js';
import {
	deleteFromCloudinary,
	uploadToCloudinary
} from '../../services/cloudinary/cloudinaryServices.js';

export const registerUser = asyncHandler(
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
		if (
			[
				firstName,
				lastName,
				phoneNumber,
				gender,
				email,
				countryCode,
				isVerified
			].some(
				(field) =>
					typeof field === 'undefined' ||
					(typeof field === 'string' && field.trim() === '')
			)
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
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000
			})
			.json(
				new apiResponse(
					201,
					{ user, token, role: 'user' },
					'User Registered Successfully'
				)
			);
	}
);

export const loginWithOtp = asyncHandler(
	async (req: Request, res: Response) => {
		const { phoneNumber, otp } = req.body;
		let role = 'user';
		if (!phoneNumber || !otp) {
			throw new ApiError(400, 'Phone number and OTP are required');
		}

		const isVerified = await otpVerification(phoneNumber, otp);
		if (!isVerified) {
			throw new ApiError(400, 'Incorrect OTP');
		}

		let user: IUser | ICaptain | null = null;

		if (role === 'user') {
			user = await User.findOne({ phoneNumber });
			if (!user) {
				user = await Captain.findOne({ phoneNumber });
				role = 'captain';
			}
		}

		if (!user) {
			throw new ApiError(404, 'User not found. Please register first.');
		}

		const token = user.generateJWT();
		if (!token) {
			throw new ApiError(500, 'Token generation failed');
		}

		res
			.status(200)
			.cookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000
			})
			.json(new apiResponse(200, { user, token, role }, 'Login successful'));
	}
);

export const logout = async (req: Request, res: Response) => {
	const token =
		req.headers.authorization?.split(' ')[1] || req.cookies?.auth_token;
	if (!token) {
		throw new ApiError(400, 'Token Missing! Unable to Logout');
	}

	const decoded = jwt.decode(token) as { exp: number };
	const ttl = decoded.exp - Math.floor(Date.now() / 1000);

	await redisClient.setex(`blacklistedToken:${token}`, ttl, 'true');

	res
		.status(200)
		.clearCookie('auth_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 0
		})
		.json(new apiResponse(200, null, 'Successfully Logged Out'));
};

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
	const { phoneNumber } = req.body;

	if (!phoneNumber || typeof phoneNumber !== 'string') {
		throw new ApiError(400, 'Valid phone number is required');
	}

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

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
	const { phoneNumber, otp } = req.body;

	if (!phoneNumber || !otp) {
		throw new ApiError(400, 'Phone number and OTP are required');
	}

	const isVerified = await otpVerification(phoneNumber, otp);
	if (!isVerified) {
		throw new ApiError(401, 'OTP verification failed');
	}

	res.status(200).json(new apiResponse(200, true, 'OTP Verified Successfully'));
});

export const avatarUpload = asyncHandler(
	async (req: IRequest, res: Response) => {
		const id = req?.user?.user._id;
		const role = req?.user?.role;
		if (!id || !role) {
			throw new ApiError(400, 'User or role information missing');
		}
		if (!req.file) throw new ApiError(400, 'No file provided');
		const folder = `yaatrika/avatars/${role}`;

		const fileBuffer = req.file.buffer;

		let userOrCaptain;
		if (role === 'user') {
			userOrCaptain = await User.findById(id);
		} else if (role === 'captain') {
			userOrCaptain = await Captain.findById(id);
		} else {
			throw new ApiError(400, 'Invalid Role');
		}

		if (!userOrCaptain) {
			throw new ApiError(404, `${role} not found`);
		}

		// Remove old avatar from Cloudinary if exists
		if (userOrCaptain.avatar?.publicId) {
			await deleteFromCloudinary(userOrCaptain.avatar.publicId);
		}

		// Upload new avatar
		const uploadResult: any = await uploadToCloudinary(fileBuffer, folder);

		userOrCaptain.avatar = {
			url: uploadResult.secure_url,
			publicId: uploadResult.public_id
		};

		await userOrCaptain.save();

		res.status(200).json(
			new apiResponse(
				201,
				{
					url: uploadResult.secure_url,
					publicId: uploadResult.public_id
				},
				'Avatar uploaded successfully'
			)
		);
	}
);

export const updateProfile = asyncHandler(
	async (req: IRequest, res: Response) => {
		const id = req?.user?.user._id;
		const { fullName, email, phoneNumber } = req.body;
		if (
			[
				fullName,
				phoneNumber,
				email,
			].some(
				(field) =>
					typeof field === 'undefined' ||
					(typeof field === 'string' && field.trim() === '')
			)
		) {
			throw new ApiError(400, 'All fields are required');
		}
		const {firstName, lastName} = fullName.split(" ");
		const user = await User.findByIdAndUpdate({_id: id}, {firstName, lastName, phoneNumber, email});
		if(!user){
			throw new ApiError(500, "Failed to update profile");
		}
		res.status(200).json(new  apiResponse(200, {user}, "Profile updated successfully"));
	}
);
