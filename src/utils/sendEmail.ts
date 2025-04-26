// utils/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

export const sendEmailOTP = async (email: string, otp: string) => {
	await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Your Yaatrika OTP Verification Code',
		html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
	});
};
