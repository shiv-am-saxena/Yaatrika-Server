import { Router } from "express";
import { registerUser } from "../controllers/auth/userAuth.controller.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

const authRouter = Router();

authRouter.route('/register').post(registerUser);

export default authRouter;
