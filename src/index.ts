import dotenv from 'dotenv';
import connectDb from './db/mongooseConnection.js';
import { app } from './app.js';
import errorHandler from './middlewares/errorHandler.js';
dotenv.config();
const port = process.env.PORT || 8080;

connectDb()
	.then(() => {
		app.listen(port, () => {
			console.log(`Server is running at port ${port}`);
		});
	})
	.catch((err) => {
		console.log(`Connection to the database failed due to ${err}`);
	});

app.use(errorHandler);