import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';

export const registerUser = asyncHandler(
	async (req: Request, res: Response) => {
		const { firstName, email, password } = req.body;

		if (
            [firstName, email, password].some(
                (field) => field?.trim() === '' || typeof field === 'undefined'
            )
        ) {
            throw new ApiError(400, 'All fields are required');
        }
		const existingUser = await User.findOne({ email });//checks whether the user already exist or not
		if (existingUser) {
			throw new ApiError(400, 'User already exists');
		} //checks if the user already exist in the database
		const encryptedPassword = await User.hashPassword(password); // hash the password in the encrypted form
        const userAck = await User.create({
            fullName: {
                firstName,
            },
            email,
            password: encryptedPassword,
        });
        if(!userAck){
            throw new ApiError(500, 'Failed to register user');
        }
        const userData = await User.findById(userAck._id);
        const authToken = userAck.genJWT();
        if(!authToken){
            throw new ApiError(500, 'Failed to generate JWT Token');
        }
        res
		.status(201)
		.setHeader('Authorization', authToken)
		.cookie('authToken', authToken) // setting auth token as cookie
		.json(
			new apiResponse(
				200,
				{ token: authToken, user: userData },
				'User Registered Successfully'
			)
		);
	}
);
