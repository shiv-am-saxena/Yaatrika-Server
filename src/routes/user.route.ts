import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { body } from 'express-validator';
// import { isLoggedIn } from '../middlewares/isLoggedin.middleware.js';
const userRouter = Router();

userRouter
	.route('/register')
	.post(registerUser);

export default userRouter;
