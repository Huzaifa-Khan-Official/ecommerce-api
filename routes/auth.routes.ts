import express from 'express';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { login, register } from '../controller/auth.controller.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.post('/register', uploadSingle, asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;