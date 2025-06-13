import crypto from 'crypto';
import redisClient from '../redisService.js';
import ApiError from '../../utils/ApiError.js';
import dotenv from 'dotenv';
dotenv.config();
const OTP_TTL = 300; // seconds (5 minutes)
const OTP_SECRET = process.env.OTP_SECRET as string; // keep this in .env

/**
 * Generate a secure 6-digit OTP
 */
export const generateOtp = (): string => {
	return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP using HMAC + SHA256
 */
const hashOtp = (otp: string): string => {
	return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
};

/**
 * Save hashed OTP to Redis with TTL
 */
export const saveOtpToRedis = async (
	phoneNumber: string,
	otp: string,
	ttl: number = OTP_TTL
): Promise<boolean> => {
	const hashedOtp = hashOtp(otp);
	try {
		await redisClient.set(phoneNumber, hashedOtp, 'EX', ttl);
		return true;
	} catch (error) {
		throw new ApiError(500, 'Failed to store OTP in Redis');
	}
};

/**
 * Compare hashed OTP from Redis with incoming OTP
 */
export const verifyOtpFromRedis = async (
	phoneNumber: string,
	userOtp: string
): Promise<boolean> => {
	const storedHash = await redisClient.get(phoneNumber);
	if (!storedHash) return false;

	const incomingHash = hashOtp(userOtp);
	return storedHash === incomingHash;
};

/**
 * Delete OTP from Redis
 */
export const deleteOtp = async (phoneNumber: string): Promise<void> => {
	await redisClient.del(phoneNumber);
};
