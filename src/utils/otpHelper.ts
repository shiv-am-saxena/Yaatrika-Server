// utils/otpUtils.ts
import crypto from 'crypto';

export const generateOTP = () =>
	Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

export const hashOTP = (otp: string): string =>
	crypto.createHash('sha256').update(otp).digest('hex');
