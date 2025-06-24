import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { getAddress, getCoordinates, getSuggestion, getTimeDistance } from "../controllers/maps/maps.controller.js";

const router = Router();

router.post('/get-coordinates', isLoggedIn, getCoordinates);
router.post('/get-time-distance', isLoggedIn, getTimeDistance);
router.post('/get-suggestions', isLoggedIn, getSuggestion);
router.post('/get-address', isLoggedIn, getAddress);

export default router;