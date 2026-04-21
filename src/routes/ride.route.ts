import { Router } from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
	acceptRide,
	createRide,
	fareCalculation,
	getCurrentRide,
	startRideWithOtp,
	endRide,
	getCaptainStats
} from '../controllers/ride/ride.controller.js';
const rideRouter = Router();

rideRouter.post('/create', isLoggedIn, createRide);
rideRouter.post('/accept', isLoggedIn, acceptRide);
rideRouter.post('/start', isLoggedIn, startRideWithOtp);
rideRouter.post('/end-ride', isLoggedIn, endRide);
rideRouter.get('/current', isLoggedIn, getCurrentRide);
rideRouter.get('/stats', isLoggedIn, getCaptainStats);
rideRouter.post('/get-fare', isLoggedIn, fareCalculation);

export default rideRouter;
