import { Router } from "express";
import { loginWithOtp, logout, registerUser, sendOtp } from "../controllers/auth/userAuth.controller.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

const authRouter = Router();

authRouter.route('/register').post(registerUser);
authRouter.route('/login').post(loginWithOtp);
authRouter.route('/logout').get(isLoggedIn, logout);
authRouter.route('/send-otp').post(sendOtp);

export default authRouter;
