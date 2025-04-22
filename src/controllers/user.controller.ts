import { Request, Response } from 'express';
import User from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { apiResponse } from '../utils/apiResponse';


/**
 * Controller to handle user register
 * @route POST client/api/auth/register
 * @access Public
 */

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
	const { name, email, password, phone } = req.body;

	// Validate required fields
	if (
        [name, email, password, phone].some(
            (field) => field?.trim() === '' || typeof field === 'undefined'
        )
    ) {
        throw new ApiError(400, 'All fields are required');
    }

	// Check for existing user
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new ApiError(409, 'User already exists with this email');
	}

	// Create new user instance
	const newUser = new User({
		name,
		email,
		password,
		phone,
		userType: 'passenger',
	});

	// Save user to database
	const savedUser = await newUser.save();
	if (!savedUser) {
		throw new ApiError(500, 'Failed to register user');
	}

	// Generate JWT token using model method
	const token = savedUser.generateJWT();
	if (!token) {
		throw new ApiError(500, 'Failed to generate JWT Token');
	}

	// Set token in cookie and response header
	res
		.status(201)
		.setHeader('Authorization', `Bearer ${token}`)
		.cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})
		.json(
			new apiResponse(
				201,
				{
					token,
					user: {
						fullName: savedUser.name,
						email: savedUser.email,
						phone: savedUser.phone,
						userType: savedUser.userType,
					},
				},
				'User registered successfully'
			)
		);
});

/**
 * Controller to handle user login
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate required fields
    if (
        [email, password].some(
            (field) => field?.trim() === '' || typeof field === 'undefined'
        )
    ) {
        throw new ApiError(400, 'All fields are required');
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = user.generateJWT();
    if (!token) {
        throw new ApiError(500, 'Failed to generate JWT Token');
    }

    // Set token in cookie and response header
    res
        .status(200)
        .setHeader('Authorization', `Bearer ${token}`)
        .cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json(
            new apiResponse(
                200,
                {
                    token,
                    user: {
                        id: user._id,
                        fullName: user.name,
                        email: user.email,
                        phone: user.phone,
                    },
                },
                'Login successful'
            )
        );
});

/**
 * Controller to handle user logout
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    // Clear the auth token cookie
    res
        .status(200)
        .clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        })
        .json(new apiResponse(200, null, 'Logout successful'));
});
