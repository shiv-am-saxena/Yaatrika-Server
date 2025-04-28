import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import { isLoggedIn } from './middlewares/isLoggedIn.js';
import { apiResponse } from './utils/apiResponse.js';
const app = express();

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
	res.send('Hello hai re baba');
});

app.use('/api/v1/user/auth', userRouter);
app.get('/verify-token', isLoggedIn, (req: Request, res: Response) => {
	res
		.status(200)
		.json(
			new apiResponse(
				200,
				{user: (req as any).user }
			)
		);
});
export { app };
