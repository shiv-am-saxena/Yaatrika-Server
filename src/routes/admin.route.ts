import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { setFareRates } from "../controllers/admin/fare/fare.controller.js";
const adminRouter = Router();

adminRouter.post('/set-fare', isLoggedIn, setFareRates);

export default adminRouter;