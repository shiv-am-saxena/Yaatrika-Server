import { Router } from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
	acceptRide,
	createRide,
	fareCalculation,
	getCurrentRide,
	startRideWithOtp
} from '../controllers/ride/ride.controller.js';
const rideRouter = Router();

rideRouter.post('/create', isLoggedIn, createRide);
rideRouter.post('/accept', isLoggedIn, acceptRide);
rideRouter.post('/start', isLoggedIn, startRideWithOtp);
rideRouter.get('/current', isLoggedIn, getCurrentRide);
rideRouter.post('/get-fare', isLoggedIn, fareCalculation);

export default rideRouter;
