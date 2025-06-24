import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { createRide, fareCalculation } from "../controllers/ride/ride.controller.js";
const rideRouter = Router();

rideRouter.post('/create', isLoggedIn, createRide);
rideRouter.post('/get-fare', isLoggedIn, fareCalculation);

export default rideRouter;