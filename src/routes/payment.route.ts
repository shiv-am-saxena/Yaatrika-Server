import { Router } from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
	createRazorpayOrder,
	verifyRazorpayPayment,
} from '../controllers/payment/payment.controller.js';

const paymentRouter = Router();

paymentRouter.post('/create-order', isLoggedIn, createRazorpayOrder);
paymentRouter.post('/verify-payment', isLoggedIn, verifyRazorpayPayment);

export default paymentRouter;
