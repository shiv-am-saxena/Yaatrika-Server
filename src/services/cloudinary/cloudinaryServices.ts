import cloudinary from './cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

export const uploadToCloudinary = async (
	fileBuffer: Buffer,
	folder: string
) => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				public_id: uuidv4(),
				resource_type: 'auto'
			},
			(error: any, result: any) => {
				if (error) return reject(error);
				resolve(result);
			}
		);
		Readable.from(fileBuffer).pipe(uploadStream);
	});
};

export const deleteFromCloudinary = async (publicId: string) => {
	return cloudinary.uploader.destroy(publicId);
};

export const fetchAssetDetails = async (publicId: string) => {
	return cloudinary.api.resource(publicId);
};
