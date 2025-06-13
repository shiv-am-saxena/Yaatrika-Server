import ApiError from '../utils/ApiError.js';
import { deleteOtp, verifyOtpFromRedis } from './otpService/otp.service.js';
import { verifyOtpCode } from './otpService/sms.service.js';

/**
 * Verifies the OTP using either Redis (non-production) or Twilio (production)
 * @param phoneNumber - User's phone number
 * @param otp - OTP entered by user
 * @returns true if verified, otherwise throws an ApiError
 */
export const otpVerification = async (
	phoneNumber: string,
	otp: string
): Promise<boolean> => {
	const isProduction = process.env.NODE_ENV === 'production';

	const isVerified = isProduction
		? await verifyOtpCode(phoneNumber, otp)
		: await verifyOtpFromRedis(phoneNumber, otp);

	if (!isVerified) {
		throw new ApiError(401, 'Invalid or expired OTP');
	}

	if (!isProduction) {
		await deleteOtp(phoneNumber); // Clean up OTP from Redis
	}

	return true;
};
