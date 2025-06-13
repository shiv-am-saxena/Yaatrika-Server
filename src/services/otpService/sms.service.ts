import  Twilio  from 'twilio';
import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';

const useTwilio = process.env.NODE_ENV === 'production';

const sid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const vsid = process.env.TWILIO_VERIFY_SID;
let twilioClient: Twilio.Twilio;

if (useTwilio) {
	twilioClient = Twilio(sid, authToken);
	console.log('Twilio Configured Successfully');
}

export const sendVerificationOtp = async (
	phoneNumber: string
): Promise<VerificationInstance> => {
	const res = await twilioClient.verify.v2
		.services(vsid as string)
		.verifications.create({
			to: phoneNumber,
			channel: 'sms'
		});

	console.log(`✅ Verification SID: ${res.sid}`);
	return res;
};

export const verifyOtpCode = async (
	phoneNumber: string,
	otp: string
): Promise<boolean> => {
	if (!useTwilio || !twilioClient) {
		console.log(`[DEV] OTP check for ${phoneNumber} with code ${otp}`);
		return true;
	}

	try {
		const verificationCheck = await twilioClient.verify.v2
			.services(vsid as string)
			.verificationChecks.create({
				to: phoneNumber,
				code: otp
			});

		return verificationCheck.status === 'approved';
	} catch (err) {
		console.error('❌ OTP verification failed:', err);
		return false;
	}
};

