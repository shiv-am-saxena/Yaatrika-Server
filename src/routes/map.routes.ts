import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { getCoordinates, getSuggestion, getTimeDistance } from "../controllers/maps/maps.controller.js";

const router = Router();

router.post('/get-coordinates', isLoggedIn, getCoordinates);
router.post('/get-time-distance', isLoggedIn, getTimeDistance);
router.get('/get-suggestions', isLoggedIn, getSuggestion);

export default router;