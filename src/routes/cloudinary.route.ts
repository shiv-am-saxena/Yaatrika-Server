import { Router } from 'express';
import { upload } from '../middlewares/uploadHandler.js';
import {
	uploadAsset,
	deleteAsset,
	getAsset
} from '../controllers/cloudinary/cloudinary.controller.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadAsset);
router.delete('/delete', deleteAsset);
router.get('/:publicId', getAsset);

export default router;
