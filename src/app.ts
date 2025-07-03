import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiResponse } from './utils/apiResponse.js';
import ApiError from './utils/ApiError.js';
import authRouter from './routes/auth.route.js';
import mapsRouter from './routes/map.routes.js';
import { stream } from './utils/logger.js';
import morgan from 'morgan';
import { IRequest } from './types/express/index.js';
import { isLoggedIn } from './middlewares/isLoggedIn.js';
import adminRouter from './routes/admin.route.js';
import rideRouter from './routes/ride.route.js';
import cloudinaryRouter from './routes/cloudinary.route.js';
const app = express();

app.use(morgan('combined', { stream }));
app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
	res.send('Welcome to Yaatrika API');
});
app.get('/api/v1/verify-token', isLoggedIn, (req: IRequest, res: Response) => {
	// This endpoint is used to verify the token and return user details
	const user = req.user; // Assuming req.user is set by a middleware that verifies the token
	if (!user) {
		throw new ApiError(401, 'Unauthorized');
	}
	res.status(200).json(new apiResponse(200, user, 'User Authenticated'));
});
app.use('/api/v1/auth/', authRouter);
app.use('/api/v1/map/', mapsRouter);
app.use('/api/v1/admin/', adminRouter);
app.use('/api/v1/ride/', rideRouter);
app.use('/api/vi/cloudinary/', cloudinaryRouter)
export { app };