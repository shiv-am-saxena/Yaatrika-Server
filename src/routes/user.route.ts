import { Router } from 'express';
import {
	loginUser,
	logoutUser,
	registerUser
} from '../controllers/user.controller.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { addEmergencyContact, getEmergencyContacts } from '../controllers/emergencyContact.controller.js';
import { bookTrip, updateTripStatus } from '../controllers/trip.controller.js';

const userRouter = Router();

userRouter.route('/client/register').post(registerUser);
userRouter.route('/client/login').post(loginUser);
userRouter.route('/logout').post(isLoggedIn, logoutUser);
userRouter.route('/emergency-contacts').post(isLoggedIn, addEmergencyContact);
userRouter.route('/emergency-contacts').get(isLoggedIn, getEmergencyContacts);
userRouter.route('/trips').post(isLoggedIn, bookTrip);
userRouter.route('/trips/status').patch(isLoggedIn, updateTripStatus);

export default userRouter;
