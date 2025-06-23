import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { createRide } from "../controllers/ride/ride.controller.js";
const rideRouter = Router();

rideRouter.post('/create', isLoggedIn, createRide);

export default rideRouter;