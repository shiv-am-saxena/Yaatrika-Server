import { Request, Response } from 'express';
import Trip from '../models/trip.model.js';
import Driver from '../models/driver.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const bookTrip = asyncHandler(async (req: Request, res: Response) => {
    const { startLocation, endLocation, fare } = req.body;
    const passengerId = (req as any).user?._id;

    if (!startLocation || !endLocation || !fare) {
        throw new ApiError(400, 'All fields are required');
    }

    // Find the nearest available driver
    const driver = await Driver.findOne({ availabilityStatus: 'available' });
    if (!driver) {
        throw new ApiError(404, 'No available drivers');
    }

    // Create a new trip
    const trip = await Trip.create({
        driverId: driver._id,
        passengerId,
        startLocation,
        endLocation,
        fare,
        status: 'ongoing'
    });

    // Update driver availability
    driver.availabilityStatus = 'unavailable';
    await driver.save();

    res.status(201).json({ success: true, data: trip });
});

export const updateTripStatus = asyncHandler(async (req: Request, res: Response) => {
    const { tripId, status } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new ApiError(404, 'Trip not found');
    }

    trip.status = status;
    await trip.save();

    // If trip is completed or cancelled, make the driver available
    if (status === 'completed' || status === 'cancelled') {
        const driver = await Driver.findById(trip.driverId);
        if (driver) {
            driver.availabilityStatus = 'available';
            await driver.save();
        }
    }

    res.status(200).json({ success: true, data: trip });
});