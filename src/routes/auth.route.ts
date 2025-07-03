import { Router } from 'express';
import { upload } from '../middlewares/uploadHandler.js';
import {
	loginWithOtp,
	logout,
	registerUser,
	sendOtp,
	verifyOtp,
	avatarUpload,
	updateProfile
} from '../controllers/auth/userAuth.controller.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { registerCaptain } from '../controllers/auth/captainAuth.controller.js';

const authRouter = Router();

authRouter.route('/user/register').post(registerUser);
authRouter.route('/captain/register').post(registerCaptain);
authRouter.route('/login').post(loginWithOtp);
authRouter.route('/logout').get(isLoggedIn, logout);
authRouter.route('/send-otp').post(sendOtp);
authRouter.route('/verify-otp').post(verifyOtp);
authRouter.route('/avatar').post(isLoggedIn, upload.single('file'), avatarUpload);
authRouter.route('/profile').post(isLoggedIn, updateProfile);
export default authRouter;