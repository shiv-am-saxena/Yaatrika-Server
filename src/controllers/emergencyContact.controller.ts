import { Request, Response } from 'express';
import EmergencyContact from '../models/emergencyContact.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const addEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    const passengerId = (req as any).user?._id;

    if (!name || !phone) {
        throw new ApiError(400, 'Name and phone are required');
    }

    const contact = await EmergencyContact.create({ passengerId, name, phone });
    res.status(201).json({ success: true, data: contact });
});

export const getEmergencyContacts = asyncHandler(async (req: Request, res: Response) => {
    const passengerId = (req as any).user?._id;

    const contacts = await EmergencyContact.find({ passengerId });
    res.status(200).json({ success: true, data: contacts });
});